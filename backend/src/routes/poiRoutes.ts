import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const db = { query: async (text: string, params?: any[]) => ({ rows: [] as any[] }) };
const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, is_active } = req.query;
    
    let query = `SELECT id, name, description, category, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, is_active FROM poi_places WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true');
    }

    const result = await db.query(query, params);
    res.json({ success: true, pois: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/nearby', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius, category } = req.query;
    
    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required', 400, 'BAD_REQUEST');
    }

    const rad = Math.min(Number(radius) || 5000, 50000); // default 5km, max 50km
    
    const query = `
      SELECT id, name, description, category, is_active, 
        ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng,
        ST_DistanceSphere(location::geometry, ST_SetSRID(ST_MakePoint($2, $1), 4326)) as distance 
      FROM poi_places 
      WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3) 
        AND is_active = true 
        AND ($4::text IS NULL OR category = $4) 
      ORDER BY distance 
      LIMIT 50
    `;

    const result = await db.query(query, [Number(lat), Number(lng), rad, category || null]);
    res.json({ success: true, pois: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, name, description, category, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, is_active FROM poi_places WHERE id = $1`,
      [id]
    );
    if (!result.rows.length) throw new AppError('POI not found', 404, 'NOT_FOUND');
    res.json({ success: true, poi: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateToken, requireRole('admin', 'merchant'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, lat, lng } = req.body;
    
    const result = await db.query(
      `INSERT INTO poi_places (name, description, category, location, is_active) 
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326), true) 
       RETURNING id, name, description, category, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng`,
      [name, description, category, Number(lat), Number(lng)]
    );
    
    res.status(201).json({ success: true, poi: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, category, is_active, lat, lng } = req.body;
    
    const result = await db.query(
      `UPDATE poi_places SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        is_active = COALESCE($4, is_active),
        location = CASE WHEN $5::numeric IS NOT NULL AND $6::numeric IS NOT NULL THEN ST_SetSRID(ST_MakePoint($6, $5), 4326) ELSE location END,
        updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, description, category, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, is_active`,
      [name, description, category, is_active, lat, lng, id]
    );

    if (!result.rows.length) throw new AppError('POI not found', 404, 'NOT_FOUND');
    res.json({ success: true, poi: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await db.query(`UPDATE poi_places SET is_active = false WHERE id = $1 RETURNING id`, [id]);
    
    if (!result.rows.length) throw new AppError('POI not found', 404, 'NOT_FOUND');
    res.json({ success: true, message: 'POI soft deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
