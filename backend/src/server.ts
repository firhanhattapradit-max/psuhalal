import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createClient, RedisClientType } from 'redis';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

// --- 1. Environment Config ---
const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key-change-me-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN || '',
  HMAC_SECRET: process.env.HMAC_SECRET || 'hmac-secret-key'
};

// --- 2. Winston Logger ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (config.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// --- Type declarations ---
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

// --- 3. PostgreSQL Pool ---
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// --- 4. Redis Client ---
const redisClient: RedisClientType = createClient({
  url: config.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  }
});

const publisherClient: RedisClientType = redisClient.duplicate();
const subscriberClient: RedisClientType = redisClient.duplicate();

Promise.all([redisClient.connect(), publisherClient.connect(), subscriberClient.connect()])
  .then(() => logger.info('Redis clients connected'))
  .catch(err => logger.error('Redis connection error', err));

const app = express();
const httpServer = createServer(app);

// --- 5. Express Middleware Stack ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));
app.use(compression());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

// Morgan-style request logger
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many authentication attempts.'
});

// JWT Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user as { id: string; role: string; email: string };
    next();
  });
};

// --- 6. REST API Routes ---
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';
  try {
    const client = await pool.connect();
    client.release();
    dbStatus = 'connected';
  } catch (e) {
    logger.error('DB health check failed', e);
  }
  if (redisClient.isReady) {
    redisStatus = 'connected';
  }
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: dbStatus, redis: redisStatus });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { email, password, role } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Simplified password hash and insert
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [email, 'hashed_password_mock', role || 'passenger']
    );
    const userId = userResult.rows[0].id;
    await client.query('INSERT INTO wallets (user_id, balance) VALUES ($1, $2)', [userId, 0]);
    await client.query('COMMIT');
    res.status(201).json({ success: true, userId });
  } catch (err: any) {
    await client.query('ROLLBACK');
    logger.error('Registration error', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT id, role, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    // Mock check
    const token = jwt.sign({ id: user.id, role: user.role, email }, config.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/vehicles/route/:routeId', async (req, res) => {
  try {
    const routeId = req.params.routeId;
    // Mock logic using Redis GEOPOS or reading keys
    res.json({ routeId, vehicles: [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/pois', async (req, res) => {
  const { category, lat, lng, radius } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM pois WHERE ST_DWithin(location, ST_MakePoint($1, $2), $3)`
      // simplified query
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/prayer-times', async (req, res) => {
  // forward to prayerService
  res.json({ success: true, times: [] });
});

app.post('/api/checkin', authenticateToken, async (req, res) => {
  try {
    // call antiCheatService.validateCheckin, award points
    res.json({ success: true, pointsAwarded: 10 });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/wallet', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT balance FROM wallets WHERE user_id = $1', [req.user?.id]);
    res.json({ balance: result.rows[0]?.balance || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/redemptions', authenticateToken, async (req, res) => {
  // redeem reward (atomic)
  res.json({ success: true });
});

app.post('/api/sadaqah/convert', authenticateToken, async (req, res) => {
  // convert points to donation
  res.json({ success: true });
});

app.get('/api/quests', authenticateToken, async (req, res) => {
  res.json({ quests: [] });
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, balance FROM wallets ORDER BY balance DESC LIMIT 20');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- 8. ETA Calculation Utility ---
function calculateETA(vehicleLat: number, vehicleLng: number, stopLat: number, stopLng: number, speedKmh: number): { distanceMeters: number; etaMinutes: number } {
  const R = 6371e3; // metres
  const φ1 = vehicleLat * Math.PI/180; // φ, λ in radians
  const φ2 = stopLat * Math.PI/180;
  const Δφ = (stopLat-vehicleLat) * Math.PI/180;
  const Δλ = (stopLng-vehicleLng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distanceMeters = R * c; // in metres
  
  const speed = speedKmh > 0 ? speedKmh : 30; // default 30 km/h
  const speedMpM = (speed * 1000) / 60; // meters per minute
  
  const etaMinutes = distanceMeters / speedMpM;
  
  return { distanceMeters, etaMinutes };
}

// --- 7. Socket.io Server ---
const io = new SocketIOServer(httpServer, {
  cors: { origin: config.CORS_ORIGIN, methods: ['GET', 'POST'] }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
    if (err) return next(new Error('Authentication error'));
    socket.data.user = user;
    next();
  });
});

const driversNsp = io.of('/drivers');
const passengersNsp = io.of('/passengers');

driversNsp.on('connection', (socket) => {
  socket.on('location:update', async (data) => {
    try {
      const { vehicle_id, lat, lng, speed, heading, available_seats, route_id } = data;
      const result = await pool.query('SELECT user_id FROM vehicles WHERE id = $1', [vehicle_id]);
      if (result.rows.length === 0 || result.rows[0].user_id !== socket.data.user.id) {
         return socket.emit('error', { success: false, error: 'Unauthorized vehicle' });
      }

      await redisClient.geoAdd('vehicles:geo', { longitude: lng, latitude: lat, member: vehicle_id });
      await redisClient.set(`vehicle:meta:${vehicle_id}`, JSON.stringify(data), { EX: 30 });
      await pool.query(
        'INSERT INTO vehicle_locations (vehicle_id, lat, lng, speed, heading, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())',
        [vehicle_id, lat, lng, speed, heading]
      );
      if (route_id) {
        await publisherClient.publish(`route:${route_id}:locations`, JSON.stringify(data));
      }
    } catch (err: any) {
      socket.emit('error', { success: false, error: err.message });
    }
  });
  
  socket.on('trip:start', async (data) => {
    // start trip logic
  });
  
  socket.on('trip:end', async (data) => {
    // end trip logic
  });
});

passengersNsp.on('connection', (socket) => {
  socket.on('subscribe:route', (data) => {
    try {
      if (data && data.route_id) {
        socket.join(`route:${data.route_id}`);
      }
    } catch (err: any) {
      socket.emit('error', { success: false, error: err.message });
    }
  });

  socket.on('unsubscribe:route', (data) => {
    try {
      if (data && data.route_id) {
        socket.leave(`route:${data.route_id}`);
      }
    } catch (err: any) {
      socket.emit('error', { success: false, error: err.message });
    }
  });

  socket.on('heartbeat:location', async (data) => {
    try {
      const { lat, lng } = data;
      const userId = socket.data.user.id;
      const key = `user:heartbeats:${userId}`;
      const payload = JSON.stringify({ lat, lng, ts: Date.now() });
      await redisClient.lPush(key, payload);
      await redisClient.lTrim(key, 0, 99);
      
      // Also persist to user_location_heartbeats table every 10th heartbeat
      const length = await redisClient.lLen(key);
      if (length % 10 === 0) {
        await pool.query('INSERT INTO user_location_heartbeats (user_id, lat, lng, timestamp) VALUES ($1, $2, $3, NOW())', [userId, lat, lng]);
      }
    } catch (err: any) {
      socket.emit('error', { success: false, error: err.message });
    }
  });
});

subscriberClient.pSubscribe('route:*:locations', (message, channel) => {
  const parts = channel.split(':');
  if (parts.length === 3 && parts[0] === 'route' && parts[2] === 'locations') {
    const routeId = parts[1];
    passengersNsp.to(`route:${routeId}`).emit('vehicle:location', JSON.parse(message));
  }
});

// --- 9. Graceful Shutdown ---
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
  io.close();
  await subscriberClient.quit();
  await publisherClient.quit();
  await redisClient.quit();
  await pool.end();
  logger.info('Shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

httpServer.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`);
});
