import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Placeholder for database connection and Redis (Assume imported from your project's db config)
// import db from '../db';
// import redisClient from '../redis';
const db = { query: async (text: string, params?: any[]) => ({ rows: [] as any[] }) };
const redisClient = { setEx: async (k: string, t: number, v: string) => {}, get: async (k: string) => null };

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-prod';
const JWT_EXPIRES_IN = '7d';

const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: { message: 'Too many login attempts, please try again later.' } }
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().required(),
  role: Joi.string().valid('passenger', 'driver', 'merchant', 'admin').required(),
  preferred_language: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  preferred_language: Joi.string().optional(),
  avatar_url: Joi.string().uri().optional()
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) throw error;

    const { name, email, password, phone, role, preferred_language } = value;
    const hashedPassword = await bcrypt.hash(password, 12);

    // Transaction
    await db.query('BEGIN');
    
    const userRes = await db.query(
      `INSERT INTO users (name, email, password, phone, role, preferred_language) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, phone, preferred_language`,
      [name, email, hashedPassword, phone, role, preferred_language || 'en']
    );
    const user = userRes.rows[0];

    // Create wallet
    await db.query(`INSERT INTO wallets (user_id, balance) VALUES ($1, $2)`, [user.id, 0]);

    await db.query('COMMIT');

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    next(err);
  }
});

router.post('/login', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) throw error;

    const { email, password } = value;
    const userRes = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const userProfile = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, preferred_language: user.preferred_language };
    res.json({ success: true, token, user: userProfile });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // Decode to get expiration, set in redis blacklist
      const decoded: any = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await redisClient.setEx(`bl_${token}`, expiresIn, 'revoked');
        }
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRes = await db.query(
      `SELECT id, name, email, role, phone, preferred_language, avatar_url, created_at FROM users WHERE id = $1`,
      [req.user!.id]
    );
    if (!userRes.rows.length) throw new AppError('User not found', 404, 'NOT_FOUND');
    res.json({ success: true, user: userRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) throw error;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(val);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: 'No changes provided' });
    }

    params.push(req.user!.id);
    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING id, name, email, role, phone, preferred_language, avatar_url`;
    
    const userRes = await db.query(query, params);
    res.json({ success: true, user: userRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError('Token required', 400, 'BAD_REQUEST');

    // Basic implementation: in a real world scenario you might use long lived refresh tokens.
    // For this requirement, we decode and re-sign.
    const decoded: any = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    if (!decoded || !decoded.id) throw new AppError('Invalid token', 401, 'INVALID_TOKEN');

    const newToken = jwt.sign({ id: decoded.id, role: decoded.role, email: decoded.email, name: decoded.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, token: newToken });
  } catch (err) {
    next(err);
  }
});

export default router;
