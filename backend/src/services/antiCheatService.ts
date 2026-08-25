import { Pool } from 'pg';
import crypto from 'crypto';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

export interface CheckinValidationRequest {
  userId: string;
  poiId: string;
  userLat: number;
  userLng: number;
  qrToken?: string; // optional, if using QR method
  method: 'qr_code' | 'geofence';
}

export interface CheckinValidationResult {
  isValid: boolean;
  reason?: string;
  fraudFlags: string[];
  distanceMeters?: number;
  dwellTimeMinutes?: number;
  pointsToAward?: number;
}

export interface QRTokenPayload {
  poiId: string;
  merchantId: string;
  nonce: string;
  issuedAt: number; // unix timestamp
}

export interface HeartbeatRecord {
  lat: number;
  lng: number;
  timestamp: number;
}

export class AntiCheatService {
  private db: Pool;
  private redis: RedisClient;
  private readonly POI_DISTANCE_LIMIT_METERS = 50;
  private readonly DWELL_DISTANCE_LIMIT_METERS = 100;

  constructor(db: Pool, redis: RedisClient) {
    this.db = db;
    this.redis = redis;
  }

  public async validateCheckin(req: CheckinValidationRequest): Promise<CheckinValidationResult> {
    const fraudFlags: string[] = [];
    let distanceMeters = 0;
    let dwellTimeMinutes = 0;
    let isValid = true;
    let reason = undefined;
    const hmacSecret = process.env.HMAC_SECRET || 'default_secret';

    try {
      // 1. Anomalous pattern detection
      const anomalyResult = await this.detectAnomalousPatterns(req.userId);
      if (anomalyResult.hasAnomalies) {
        fraudFlags.push(...anomalyResult.flags);
        isValid = false;
        reason = 'Anomalous pattern detected';
      }

      // 2. Location & duplicate validation
      const geoResult = await this.validateGeofence(req.userId, req.poiId, req.userLat, req.userLng);
      distanceMeters = geoResult.distanceMeters;
      
      if (!geoResult.isWithinFence) {
        fraudFlags.push('Not within POI geofence or duplicate checkin');
        isValid = false;
        reason = reason || 'Not within geofence or checked in recently';
      }

      // 3. Dwell time validation (required minutes = 10 as per rules)
      const dwellResult = await this.validateDwellTime(req.userId, req.userLat, req.userLng, 10);
      dwellTimeMinutes = dwellResult.dwellMinutes;
      
      if (!dwellResult.isValid) {
        fraudFlags.push('Insufficient dwell time');
        isValid = false;
        reason = reason || 'Insufficient dwell time';
      }

      // 4. QR Token validation (if method is qr_code)
      if (req.method === 'qr_code') {
        if (!req.qrToken) {
          fraudFlags.push('Missing QR token for qr_code method');
          isValid = false;
          reason = reason || 'Missing QR token';
        } else {
          const qrResult = await this.validateQRToken(req.qrToken, hmacSecret, 30);
          if (!qrResult.isValid) {
            fraudFlags.push(`QR Token invalid: ${qrResult.reason}`);
            isValid = false;
            reason = reason || 'Invalid QR token';
          } else if (qrResult.poiId !== req.poiId) {
            fraudFlags.push('QR token POI mismatch');
            isValid = false;
            reason = reason || 'QR token does not match current POI';
          }
        }
      }

      let pointsToAward = 0;
      if (isValid) {
        // base 50 pts + 10 pts/minute dwell (max 200 pts total)
        const calculatedPoints = 50 + (dwellTimeMinutes * 10);
        pointsToAward = Math.min(calculatedPoints, 200);
      }

      return {
        isValid,
        reason,
        fraudFlags,
        distanceMeters,
        dwellTimeMinutes,
        pointsToAward
      };
    } catch (error) {
      console.error('Error during checkin validation:', error);
      return {
        isValid: false,
        reason: 'Internal validation error',
        fraudFlags: ['System error']
      };
    }
  }

  public async validateGeofence(userId: string, poiId: string, userLat: number, userLng: number): Promise<{ isWithinFence: boolean; distanceMeters: number }> {
    const client = await this.db.connect();
    try {
      // Check distance using PostGIS
      const distQuery = `
        SELECT ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance 
        FROM poi_places WHERE id = $3
      `;
      const distResult = await client.query(distQuery, [userLng, userLat, poiId]); // Note: PostGIS point is usually (Lng, Lat)
      
      if (distResult.rows.length === 0) {
        return { isWithinFence: false, distanceMeters: -1 };
      }
      const distance = parseFloat(distResult.rows[0].distance);

      // Check recent checkins
      const checkinQuery = `
        SELECT COUNT(*) as count 
        FROM checkins 
        WHERE user_id = $1 AND poi_id = $2 AND created_at > NOW() - INTERVAL '24 hours'
      `;
      const checkinResult = await client.query(checkinQuery, [userId, poiId]);
      const recentCheckins = parseInt(checkinResult.rows[0].count, 10);

      const isWithinFence = distance <= this.POI_DISTANCE_LIMIT_METERS && recentCheckins === 0;

      return { isWithinFence, distanceMeters: distance };
    } finally {
      client.release();
    }
  }

  public async validateDwellTime(userId: string, poiLat: number, poiLng: number, requiredMinutes: number = 10): Promise<{ isValid: boolean; dwellMinutes: number }> {
    const heartbeatsKey = `user:heartbeats:${userId}`;
    const rawHeartbeats = await this.redis.lRange(heartbeatsKey, 0, -1);
    
    if (!rawHeartbeats || rawHeartbeats.length === 0) {
      return { isValid: false, dwellMinutes: 0 };
    }

    const now = Date.now();
    const fifteenMinsMs = 15 * 60 * 1000;
    
    const validHeartbeats = rawHeartbeats.map(hb => JSON.parse(hb) as HeartbeatRecord)
      .filter(hb => now - hb.timestamp <= fifteenMinsMs)
      .filter(hb => this.haversineDistance(hb.lat, hb.lng, poiLat, poiLng) <= this.DWELL_DISTANCE_LIMIT_METERS)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (validHeartbeats.length === 0) {
      return { isValid: false, dwellMinutes: 0 };
    }

    const firstTime = validHeartbeats[0].timestamp;
    const lastTime = validHeartbeats[validHeartbeats.length - 1].timestamp;
    const dwellMinutes = (lastTime - firstTime) / (60 * 1000);

    return {
      isValid: dwellMinutes >= requiredMinutes,
      dwellMinutes: Math.floor(dwellMinutes)
    };
  }

  public generateQRToken(poiId: string, merchantId: string, secret: string): string {
    const payload: QRTokenPayload = {
      poiId,
      merchantId,
      nonce: crypto.randomBytes(16).toString('hex'),
      issuedAt: Date.now()
    };
    const payloadStr = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
    const base64Payload = Buffer.from(payloadStr).toString('base64url');
    
    return `${base64Payload}.${signature}`;
  }

  public async validateQRToken(token: string, secret: string, maxAgeSeconds: number = 30): Promise<{ isValid: boolean; poiId?: string; reason?: string }> {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { isValid: false, reason: 'Malformed token' };
    }
    
    const [base64Payload, signature] = parts;
    const payloadStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    
    let payload: QRTokenPayload;
    try {
      payload = JSON.parse(payloadStr);
    } catch (e) {
      return { isValid: false, reason: 'Invalid JSON payload' };
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
    if (expectedSignature !== signature) {
      return { isValid: false, reason: 'Invalid signature' };
    }

    const ageSeconds = (Date.now() - payload.issuedAt) / 1000;
    if (ageSeconds > maxAgeSeconds) {
      return { isValid: false, reason: 'Token expired' };
    }

    const usedKey = `used_qr_tokens:${signature}`;
    const setnxResult = await this.redis.setNX(usedKey, '1');
    if (!setnxResult) {
      return { isValid: false, reason: 'Token already used' };
    }
    await this.redis.expire(usedKey, 60);

    return { isValid: true, poiId: payload.poiId };
  }

  public async detectAnomalousPatterns(userId: string): Promise<{ hasAnomalies: boolean; flags: string[] }> {
    const flags: string[] = [];
    const client = await this.db.connect();
    
    try {
      // 1. Check check-in velocity: more than 5 check-ins in 1 hour
      const velocityQuery = `
        SELECT COUNT(*) as count 
        FROM checkins 
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'
      `;
      const velocityResult = await client.query(velocityQuery, [userId]);
      if (parseInt(velocityResult.rows[0].count, 10) > 5) {
        flags.push('High check-in velocity (>5 per hour)');
      }

      // 2. Check teleportation
      const teleportQuery = `
        SELECT poi_places.location as geom, checkins.created_at as time
        FROM checkins
        JOIN poi_places ON checkins.poi_id = poi_places.id
        WHERE user_id = $1
        ORDER BY checkins.created_at DESC
        LIMIT 2
      `;
      const teleportResult = await client.query(teleportQuery, [userId]);
      if (teleportResult.rows.length === 2) {
        const [recent, previous] = teleportResult.rows;
        
        // Use ST_DistanceSphere for fast distance calculation if available, here we approximate with DB query
        const distanceQuery = `
          SELECT ST_DistanceSphere($1, $2) as dist
        `;
        const distRes = await client.query(distanceQuery, [recent.geom, previous.geom]);
        const distMeters = parseFloat(distRes.rows[0].dist);
        
        const timeDiffMs = new Date(recent.time).getTime() - new Date(previous.time).getTime();
        const timeDiffMins = timeDiffMs / (1000 * 60);

        if (distMeters > 50000 && timeDiffMins < 5) { // > 50km in < 5 mins
          flags.push('Teleportation detected');
        }
      }
    } catch (e) {
      console.error('Error detecting anomalies', e);
    } finally {
      client.release();
    }

    return { hasAnomalies: flags.length > 0, flags };
  }

  public async recordHeartbeat(userId: string, lat: number, lng: number): Promise<void> {
    const heartbeat: HeartbeatRecord = { lat, lng, timestamp: Date.now() };
    const key = `user:heartbeats:${userId}`;
    
    await this.redis.lPush(key, JSON.stringify(heartbeat));
    await this.redis.lTrim(key, 0, 199); // LTRIM to 200 entries (0-199)
    await this.redis.expire(key, 30 * 60); // 30 minutes

    const counterKey = `user:heartbeats_counter:${userId}`;
    const count = await this.redis.incr(counterKey);
    await this.redis.expire(counterKey, 30 * 60);

    if (count % 10 === 0) {
      const client = await this.db.connect();
      try {
        const query = `
          INSERT INTO user_location_heartbeats (user_id, location, timestamp) 
          VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), to_timestamp($4))
        `;
        // PostGIS point: Lng, Lat
        await client.query(query, [userId, lng, lat, heartbeat.timestamp / 1000.0]);
      } catch (e) {
        console.error('Failed to persist heartbeat', e);
      } finally {
        client.release();
      }
    }
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (val: number) => (val * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export function generateQRTokenEndpoint(poiId: string, merchantId: string): string {
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    throw new Error('HMAC_SECRET is missing');
  }
  const payload: QRTokenPayload = {
    poiId,
    merchantId,
    nonce: crypto.randomBytes(16).toString('hex'),
    issuedAt: Date.now()
  };
  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  const base64Payload = Buffer.from(payloadStr).toString('base64url');
  
  return `${base64Payload}.${signature}`;
}
