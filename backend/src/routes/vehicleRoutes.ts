import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const db = { query: async (text: string, params?: any[]) => ({ rows: [] as any[] }) };
const redisClient = { 
  get: async (k: string) => null,
  geoSearch: async (k: string, member: string | { longitude: number, latitude: number }, options: any) => [] as any[]
};

const router = Router();

router.get('/', authenticateToken, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(`SELECT * FROM vehicles WHERE status = 'active'`);
    res.json({ success: true, vehicles: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
    const vehicle = result.rows[0];
    
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'NOT_FOUND');
    
    const locationStr = await redisClient.get(`vehicle:${id}:location`);
    const latestLocation = locationStr ? JSON.parse(locationStr as string) : null;

    res.json({ success: true, vehicle: { ...vehicle, latestLocation } });
  } catch (err) {
    next(err);
  }
});

router.get('/route/:routeId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { routeId } = req.params;
    const result = await db.query(`SELECT * FROM vehicles WHERE route_id = $1 AND status = 'active'`, [routeId]);
    const vehicles = result.rows;
    
    const vehiclesWithLocations = await Promise.all(vehicles.map(async (v) => {
      const locationStr = await redisClient.get(`vehicle:${v.id}:location`);
      return { ...v, latestLocation: locationStr ? JSON.parse(locationStr as string) : null };
    }));

    res.json({ success: true, vehicles: vehiclesWithLocations });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateToken, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { driver_id, route_id, license_plate, capacity, vehicle_type } = req.body;
    const result = await db.query(
      `INSERT INTO vehicles (driver_id, route_id, license_plate, capacity, vehicle_type, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [driver_id, route_id, license_plate, capacity, vehicle_type]
    );
    res.status(201).json({ success: true, vehicle: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', authenticateToken, requireRole('admin', 'driver'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Authorization: if driver, ensure this vehicle belongs to them
    if (req.user!.role === 'driver') {
      const vehicleCheck = await db.query(`SELECT driver_id FROM vehicles WHERE id = $1`, [id]);
      if (vehicleCheck.rows[0]?.driver_id !== req.user!.id) {
        throw new AppError('Unauthorized to update this vehicle', 403, 'FORBIDDEN');
      }
    }

    const result = await db.query(
      `UPDATE vehicles SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!result.rows.length) throw new AppError('Vehicle not found', 404, 'NOT_FOUND');
    
    res.json({ success: true, vehicle: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/eta', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { stopLat, stopLng } = req.query;
    
    if (!stopLat || !stopLng) throw new AppError('stopLat and stopLng are required', 400, 'BAD_REQUEST');

    const locationStr = await redisClient.get(`vehicle:${id}:location`);
    if (!locationStr) throw new AppError('Vehicle location unknown', 404, 'NOT_FOUND');
    
    const location = JSON.parse(locationStr as string);
    
    // Simple heuristic: distance in km / average speed (40km/h) = time in hours.
    // In a real app, use a routing engine like OSRM or Google Maps Distance Matrix.
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      return R * c; // Distance in km
    };

    const dist = getDistanceFromLatLonInKm(location.lat, location.lng, Number(stopLat), Number(stopLng));
    const etaMinutes = Math.round((dist / 40) * 60);

    res.json({ success: true, eta_minutes: etaMinutes, distance_km: dist });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/location-history', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM vehicle_locations WHERE vehicle_id = $1 ORDER BY recorded_at DESC LIMIT 100`,
      [id]
    );
    res.json({ success: true, history: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
