import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const db = { query: async (text: string, params?: any[]) => ({ rows: [] as any[] }) };

// Mocked external services
const AntiCheatService = {
  validateCheckin: async (userId: string, poiId: string, lat: number, lng: number) => true
};
const PaymentService = {
  processSadaqah: async (amount: number, charityId: string) => true
};

const router = Router();

router.get('/quests', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await db.query(`
      SELECT q.*, uqp.progress, uqp.is_completed, 
             (uqp.progress::float / q.required_actions) * 100 as completion_percentage
      FROM quests q
      LEFT JOIN user_quest_progress uqp ON q.id = uqp.quest_id AND uqp.user_id = $1
      WHERE q.is_active = true
    `, [userId]);
    res.json({ success: true, quests: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/quests/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM quests WHERE id = $1`, [id]);
    if (!result.rows.length) throw new AppError('Quest not found', 404, 'NOT_FOUND');
    
    const poiResult = await db.query(`
      SELECT p.* FROM poi_places p
      JOIN quest_pois qp ON p.id = qp.poi_id
      WHERE qp.quest_id = $1
    `, [id]);
    
    res.json({ success: true, quest: { ...result.rows[0], pois: poiResult.rows } });
  } catch (err) {
    next(err);
  }
});

router.post('/checkin', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { poiId, lat, lng } = req.body;

    const isValid = await AntiCheatService.validateCheckin(userId, poiId, lat, lng);
    if (!isValid) throw new AppError('Check-in validation failed', 403, 'ANTI_CHEAT_TRIGGERED');

    await db.query('BEGIN');

    const pointsEarned = 10; // example fixed points
    await db.query(`INSERT INTO checkins (user_id, poi_id, location, points_earned) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5)`, [userId, poiId, lat, lng, pointsEarned]);
    
    // Assume award_points is a custom PL/pgSQL function that updates wallet and returns new balance
    const awardResult = await db.query(`SELECT award_points($1, $2) as new_balance`, [userId, pointsEarned]);
    const newBalance = awardResult.rows[0].new_balance;

    // Update quest progress
    const questProgressUpdate = await db.query(`
      UPDATE user_quest_progress SET progress = progress + 1 
      WHERE user_id = $1 AND is_completed = false
      RETURNING quest_id, progress
    `, [userId]);

    const questsCompleted: any[] = [];
    // Check if any quest just completed
    for (const q of questProgressUpdate.rows) {
      const qInfo = await db.query(`SELECT required_actions, points_reward FROM quests WHERE id = $1`, [q.quest_id]);
      if (q.progress >= qInfo.rows[0].required_actions) {
        await db.query(`UPDATE user_quest_progress SET is_completed = true WHERE user_id = $1 AND quest_id = $2`, [userId, q.quest_id]);
        questsCompleted.push(q.quest_id);
        // Award quest bonus points
        await db.query(`SELECT award_points($1, $2)`, [userId, qInfo.rows[0].points_reward]);
      }
    }

    await db.query('COMMIT');

    res.json({ success: true, pointsEarned, newBalance, questsCompleted });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    next(err);
  }
});

router.get('/wallet', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const walletRes = await db.query(`SELECT balance FROM wallets WHERE user_id = $1`, [userId]);
    const txRes = await db.query(`SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`, [userId]);
    
    res.json({ success: true, balance: walletRes.rows[0]?.balance || 0, transactions: txRes.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await db.query(`
      SELECT w.user_id, u.name, u.avatar_url, w.balance, 
             RANK() OVER (ORDER BY w.balance DESC) as rank 
      FROM wallets w
      JOIN users u ON w.user_id = u.id
      ORDER BY w.balance DESC LIMIT $1
    `, [limit]);

    // Find current user's rank
    const userRankRes = await db.query(`
      WITH RankedWallets AS (
        SELECT user_id, RANK() OVER (ORDER BY balance DESC) as rank FROM wallets
      )
      SELECT rank FROM RankedWallets WHERE user_id = $1
    `, [req.user!.id]);

    res.json({ 
      success: true, 
      topUsers: result.rows, 
      currentUserRank: userRankRes.rows[0]?.rank || null 
    });
  } catch (err) {
    next(err);
  }
});

router.get('/rewards', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(`SELECT * FROM rewards WHERE is_active = true`);
    res.json({ success: true, rewards: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/redemptions', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { rewardId } = req.body;

    await db.query('BEGIN');

    const rewardRes = await db.query(`SELECT points_required, stock_quantity FROM rewards WHERE id = $1 AND is_active = true FOR UPDATE`, [rewardId]);
    const reward = rewardRes.rows[0];
    if (!reward) throw new AppError('Reward not available', 404, 'NOT_FOUND');
    if (reward.stock_quantity !== -1 && reward.stock_quantity <= 0) throw new AppError('Reward out of stock', 400, 'OUT_OF_STOCK');

    const walletRes = await db.query(`SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE`, [userId]);
    const balance = walletRes.rows[0]?.balance || 0;

    if (balance < reward.points_required) throw new AppError('Insufficient points', 400, 'INSUFFICIENT_POINTS');

    await db.query(`UPDATE wallets SET balance = balance - $2 WHERE user_id = $1`, [userId, reward.points_required]);
    
    if (reward.stock_quantity !== -1) {
      await db.query(`UPDATE rewards SET stock_quantity = stock_quantity - 1 WHERE id = $1`, [rewardId]);
    }

    const code = crypto.randomBytes(16).toString('hex').toUpperCase();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const redemptionRes = await db.query(`
      INSERT INTO redemptions (user_id, reward_id, code, expires_at) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [userId, rewardId, code, expiryDate]);

    await db.query('COMMIT');

    res.json({ success: true, redemption: redemptionRes.rows[0], qrData: code });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    next(err);
  }
});

router.get('/redemptions/my', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(`
      SELECT r.*, rw.name as reward_name, rw.description 
      FROM redemptions r 
      JOIN rewards rw ON r.reward_id = rw.id 
      WHERE r.user_id = $1 ORDER BY r.created_at DESC
    `, [req.user!.id]);
    res.json({ success: true, redemptions: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/badges/my', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(`
      SELECT q.id as quest_id, q.name, q.badge_image_url 
      FROM user_quest_progress uqp
      JOIN quests q ON uqp.quest_id = q.id
      WHERE uqp.user_id = $1 AND uqp.is_completed = true
    `, [req.user!.id]);
    res.json({ success: true, badges: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/sadaqah/convert', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { points, charityId } = req.body;
    
    if (points <= 0) throw new AppError('Invalid points amount', 400, 'BAD_REQUEST');

    await db.query('BEGIN');
    
    const walletRes = await db.query(`SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE`, [userId]);
    if ((walletRes.rows[0]?.balance || 0) < points) throw new AppError('Insufficient points', 400, 'INSUFFICIENT_POINTS');

    await db.query(`UPDATE wallets SET balance = balance - $2 WHERE user_id = $1`, [userId, points]);
    
    const monetaryValue = points * 0.01; // Example conversion rate
    await PaymentService.processSadaqah(monetaryValue, charityId);
    
    await db.query(`INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES ($1, $2, 'sadaqah', 'Donation to charity')`, [userId, -points]);

    await db.query('COMMIT');
    res.json({ success: true, message: 'Donation successful' });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    next(err);
  }
});

export default router;
