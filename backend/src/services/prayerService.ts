import { Pool } from 'pg';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface PrayerTimesFormatted {
  date: string;
  location: Coordinates;
  timezone: string;
  prayers: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  nextPrayer: {
    name: string;
    time: string;
    minutesUntil: number;
  };
}

export interface QiblaDirection {
  degrees: number; // 0-360, clockwise from North
  description: string; // e.g. "NNW"
}

export interface RouteJourneyAlert {
  hasConflict: boolean;
  conflictingPrayer?: string;
  conflictTime?: string;
  nearestMosque?: {
    id: string;
    name: string;
    distanceMeters: number;
    lat: number;
    lng: number;
  };
  message: string;
  messageMs?: string;
  messageAr?: string;
}

export interface JourneyCheckRequest {
  departureLat: number;
  departureLng: number;
  estimatedDurationMinutes: number;
  currentTime?: Date;
}

export class PrayerService {
  constructor(private db: Pool) {}

  // 1. Calculate Prayer Times
  public calculatePrayerTimes(coords: Coordinates, date: Date = new Date(), timezone: string = 'Asia/Bangkok'): PrayerTimesFormatted {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Use noon as reference point for Julian Day for Dhuhr
    const jd = this.julianDay(year, month, day, 12);
    
    const { declination, equationOfTime } = this.solarCoordinates(jd);
    
    // Dhuhr is at solar noon (when Sun passes the meridian)
    const solarNoonHours = 12 - equationOfTime - (coords.lng / 15);
    const dhuhr = this.hoursToDate(date, solarNoonHours);
    
    // MWL calculations
    const fajr = this.prayerTimeFromAngle(-18, coords, jd, true, date, solarNoonHours);
    const sunrise = this.prayerTimeFromAngle(-0.833, coords, jd, true, date, solarNoonHours);
    const maghrib = this.prayerTimeFromAngle(-0.833, coords, jd, false, date, solarNoonHours);
    const isha = this.prayerTimeFromAngle(-17, coords, jd, false, date, solarNoonHours);
    
    // Shafi'i Asr
    const asr = this.asrTime(1, coords, jd, date, solarNoonHours);

    const prayerTimes: PrayerTimes = { fajr, sunrise, dhuhr, asr, maghrib, isha };

    return this.formatPrayerTimes(prayerTimes, coords, date, timezone);
  }

  private formatPrayerTimes(times: PrayerTimes, coords: Coordinates, date: Date, timezone: string): PrayerTimesFormatted {
    const formatted = {
      fajr: this.formatTimeToLocal(times.fajr, timezone),
      sunrise: this.formatTimeToLocal(times.sunrise, timezone),
      dhuhr: this.formatTimeToLocal(times.dhuhr, timezone),
      asr: this.formatTimeToLocal(times.asr, timezone),
      maghrib: this.formatTimeToLocal(times.maghrib, timezone),
      isha: this.formatTimeToLocal(times.isha, timezone),
    };

    const nextPrayer = this.calculateNextPrayer(times);

    return {
      date: date.toISOString().split('T')[0],
      location: coords,
      timezone,
      prayers: formatted,
      nextPrayer
    };
  }

  private calculateNextPrayer(times: PrayerTimes): { name: string; time: string; minutesUntil: number } {
    const now = new Date();
    const prayers = [
      { name: 'Fajr', date: times.fajr },
      { name: 'Sunrise', date: times.sunrise },
      { name: 'Dhuhr', date: times.dhuhr },
      { name: 'Asr', date: times.asr },
      { name: 'Maghrib', date: times.maghrib },
      { name: 'Isha', date: times.isha }
    ];

    let next = prayers[0];
    for (const p of prayers) {
      if (p.date > now) {
        next = p;
        break;
      }
    }

    // If all times today have passed, next prayer is Fajr tomorrow
    let nextDate = next.date;
    if (now > times.isha) {
      nextDate = new Date(times.fajr);
      nextDate.setDate(nextDate.getDate() + 1);
      next = { name: 'Fajr', date: nextDate };
    }

    const diffMs = nextDate.getTime() - now.getTime();
    const minutesUntil = Math.floor(diffMs / 1000 / 60);

    return {
      name: next.name,
      time: this.formatTimeToLocal(next.date, 'Asia/Bangkok'), // Default next prayer format TZ
      minutesUntil
    };
  }

  // 2. Qibla Direction
  public calculateQiblaDirection(userCoords: Coordinates): QiblaDirection {
    const degrees = calculateQibla(userCoords.lat, userCoords.lng);
    const points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const val = Math.floor((degrees / 22.5) + 0.5);
    const description = points[(val % 16)];

    return { degrees, description };
  }

  // 3. Check Journey Prayer Conflict
  public async checkJourneyPrayerConflict(req: JourneyCheckRequest): Promise<RouteJourneyAlert> {
    const current = req.currentTime || new Date();
    const arrival = new Date(current.getTime() + req.estimatedDurationMinutes * 60000);
    const times = this.calculatePrayerTimes({ lat: req.departureLat, lng: req.departureLng }, current);
    
    let conflictingPrayer = null;
    let conflictTimeStr = null;

    const prayersToCheck = [
      { name: 'Fajr', timeStr: times.prayers.fajr },
      { name: 'Dhuhr', timeStr: times.prayers.dhuhr },
      { name: 'Asr', timeStr: times.prayers.asr },
      { name: 'Maghrib', timeStr: times.prayers.maghrib },
      { name: 'Isha', timeStr: times.prayers.isha }
    ];

    for (const p of prayersToCheck) {
      const [h, m] = p.timeStr.split(':').map(Number);
      const pt = new Date(current);
      pt.setHours(h, m, 0, 0);

      // Simple heuristic: if prayer occurs during the journey
      if (pt > current && pt < arrival) {
        conflictingPrayer = p.name;
        conflictTimeStr = p.timeStr;
        break;
      }
    }

    if (conflictingPrayer) {
      const { rows } = await this.db.query(`
        SELECT id, name_th as name, 
          ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as dist,
          ST_Y(location) as lat, ST_X(location) as lng
        FROM poi_places 
        WHERE category = 'mosque' AND is_active = true
        ORDER BY dist ASC LIMIT 1
      `, [req.departureLng, req.departureLat]);

      const nearest = rows[0];

      return {
        hasConflict: true,
        conflictingPrayer,
        conflictTime: conflictTimeStr,
        nearestMosque: nearest ? {
          id: nearest.id,
          name: nearest.name,
          distanceMeters: Math.round(nearest.dist),
          lat: nearest.lat,
          lng: nearest.lng
        } : undefined,
        message: `Prayer ${conflictingPrayer} falls during your journey.`,
        messageMs: `Waktu solat ${conflictingPrayer} masuk semasa perjalanan anda.`,
        messageAr: `وقت صلاة ${conflictingPrayer} يقع خلال رحلتك.`
      };
    }

    return {
      hasConflict: false,
      message: "No prayer times conflict with your journey."
    };
  }

  // 4. Get Schedule for week
  public getPrayerScheduleForWeek(coords: Coordinates): PrayerTimesFormatted[] {
    const schedule: PrayerTimesFormatted[] = [];
    const baseDate = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      schedule.push(this.calculatePrayerTimes(coords, d));
    }
    return schedule;
  }

  // 5. Format Time
  public formatTimeToLocal(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    }).format(date);
  }

  // 6. Within Window
  public isWithinPrayerWindow(prayerTime: Date, windowMinutes: number = 15): boolean {
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - prayerTime.getTime());
    return diffMs <= windowMinutes * 60000;
  }

  // Math Helpers
  private julianDay(year: number, month: number, day: number, hours: number = 0): number {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hours / 24.0 + B - 1524.5;
  }

  private degToRad(deg: number): number {
    return deg * Math.PI / 180.0;
  }

  private radToDeg(rad: number): number {
    return rad * 180.0 / Math.PI;
  }

  private solarCoordinates(jd: number): { declination: number; equationOfTime: number } {
    const D = jd - 2451545.0;
    const g = (357.529 + 0.98560028 * D) % 360;
    const q = (280.459 + 0.98564736 * D) % 360;
    const L = (q + 1.915 * Math.sin(this.degToRad(g)) + 0.020 * Math.sin(this.degToRad(2 * g))) % 360;
    const e = 23.439 - 0.00000036 * D;

    const d = this.radToDeg(Math.asin(Math.sin(this.degToRad(e)) * Math.sin(this.degToRad(L))));
    const RA = this.radToDeg(Math.atan2(Math.cos(this.degToRad(e)) * Math.sin(this.degToRad(L)), Math.cos(this.degToRad(L)))) / 15.0;
    let EqT = q / 15.0 - (RA < 0 ? RA + 24 : RA > 24 ? RA - 24 : RA);
    if (EqT > 12) EqT -= 24;
    else if (EqT < -12) EqT += 24;

    return { declination: d, equationOfTime: EqT };
  }

  private prayerTimeFromAngle(angle: number, coords: Coordinates, jd: number, isRising: boolean, baseDate: Date, solarNoonHours: number): Date {
    const { declination } = this.solarCoordinates(jd);
    const cosHA = (Math.sin(this.degToRad(angle)) - Math.sin(this.degToRad(declination)) * Math.sin(this.degToRad(coords.lat))) /
                  (Math.cos(this.degToRad(declination)) * Math.cos(this.degToRad(coords.lat)));
    
    // If cosHA > 1 or < -1, the sun never reaches that angle, handle gracefully
    let HA = 0;
    if (cosHA >= -1 && cosHA <= 1) {
      HA = this.radToDeg(Math.acos(cosHA)) / 15.0;
    }
    
    const hours = isRising ? (solarNoonHours - HA) : (solarNoonHours + HA);
    return this.hoursToDate(baseDate, hours);
  }

  private asrTime(shadowFactor: number, coords: Coordinates, jd: number, baseDate: Date, solarNoonHours: number): Date {
    const { declination } = this.solarCoordinates(jd);
    const angle = this.radToDeg(Math.atan(1.0 / (shadowFactor + Math.tan(this.degToRad(Math.abs(coords.lat - declination))))));
    
    const cosHA = (Math.sin(this.degToRad(angle)) - Math.sin(this.degToRad(declination)) * Math.sin(this.degToRad(coords.lat))) /
                  (Math.cos(this.degToRad(declination)) * Math.cos(this.degToRad(coords.lat)));
                  
    let HA = 0;
    if (cosHA >= -1 && cosHA <= 1) {
      HA = this.radToDeg(Math.acos(cosHA)) / 15.0;
    }
    
    return this.hoursToDate(baseDate, solarNoonHours + HA);
  }

  private hoursToDate(baseDate: Date, utcHours: number): Date {
    const d = new Date(baseDate);
    d.setUTCHours(0, 0, 0, 0); // start at UTC midnight
    d.setTime(d.getTime() + utcHours * 3600000);
    return d;
  }
}

// Standalone exports
export function calculateQibla(userLat: number, userLng: number): number {
  const kaabaLat = 21.3891;
  const kaabaLng = 39.8579;
  
  const rad = Math.PI / 180;
  const dLng = (kaabaLng - userLng) * rad;
  const userLatRad = userLat * rad;
  const kaabaLatRad = kaabaLat * rad;
  
  const y = Math.sin(dLng) * Math.cos(kaabaLatRad);
  const x = Math.cos(userLatRad) * Math.sin(kaabaLatRad) - Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(dLng);
  
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  brng = (brng + 360) % 360;
  return brng;
}

export function getPrayerTimesForLocation(lat: number, lng: number): PrayerTimesFormatted {
  // Temporary mock pool to satisfy service constructor if used as standalone
  const mockPool = {} as Pool;
  const svc = new PrayerService(mockPool);
  return svc.calculatePrayerTimes({ lat, lng });
}
