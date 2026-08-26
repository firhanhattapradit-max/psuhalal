// Real-time Astronomical Islamic Prayer Times & Qibla Direction Calculator

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  raw: {
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
  };
  currentKey: string;
  nextKey: string;
  minutesUntilNext: number;
}

export function calculateQiblaBearing(lat: number, lng: number): number {
  const kaabaLat = 21.3891 * (Math.PI / 180);
  const kaabaLng = 39.8579 * (Math.PI / 180);
  const uLat = lat * (Math.PI / 180);
  const uLng = lng * (Math.PI / 180);

  const dLng = kaabaLng - uLng;
  const y = Math.sin(dLng);
  const x = Math.cos(uLat) * Math.tan(kaabaLat) - Math.sin(uLat) * Math.cos(dLng);
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

export function calculateRealPrayerTimes(lat: number, lng: number, date = new Date()): PrayerTimesResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  let D = julianDay - 2451545.0;

  let g = (357.529 + 0.98560028 * D) % 360;
  let q = (280.459 + 0.98564736 * D) % 360;
  let L = (q + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180)) % 360;

  let e = 23.439 - 0.00000036 * D;
  let sinDec = Math.sin(e * Math.PI / 180) * Math.sin(L * Math.PI / 180);
  let dec = Math.asin(sinDec) * 180 / Math.PI;

  let RA = Math.atan2(Math.cos(e * Math.PI / 180) * Math.sin(L * Math.PI / 180), Math.cos(L * Math.PI / 180)) * 180 / Math.PI;
  RA = (RA + 360) % 360;
  RA = RA / 15.0;

  let EqT = q / 15.0 - RA;

  const tzOffsetHours = -date.getTimezoneOffset() / 60;
  const solarNoon = 12 + tzOffsetHours - (lng / 15.0) - EqT;

  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  function hourAngle(angle: number): number {
    const cosH = (Math.sin(angle * rad) - Math.sin(lat * rad) * Math.sin(dec * rad)) / (Math.cos(lat * rad) * Math.cos(dec * rad));
    if (cosH > 1) return 0;
    if (cosH < -1) return 180 / 15;
    return Math.acos(cosH) * deg / 15.0;
  }

  const hFajr = hourAngle(-18);
  const hSunrise = hourAngle(-0.833);
  const hSunset = hourAngle(-0.833);
  const hIsha = hourAngle(-17);

  const shadowLength = 1 + Math.tan(Math.abs(lat - dec) * rad);
  const asrElevation = Math.atan(1 / shadowLength) * deg;
  const hAsr = hourAngle(asrElevation);

  function createDateFromDecimalHours(hoursDecimal: number): Date {
    const d = new Date(date);
    let h = Math.floor(hoursDecimal);
    let mins = Math.floor((hoursDecimal - h) * 60);
    let secs = Math.round(((hoursDecimal - h) * 60 - mins) * 60);
    d.setHours(h, mins, secs, 0);
    return d;
  }

  function formatTime(d: Date): string {
    let h = d.getHours();
    let mins = d.getMinutes();
    let period = h >= 12 ? 'PM' : 'AM';
    let displayH = h % 12;
    if (displayH === 0) displayH = 12;
    return `${displayH < 10 ? '0' + displayH : displayH}:${mins < 10 ? '0' + mins : mins} ${period}`;
  }

  const fajrDate = createDateFromDecimalHours(solarNoon - hFajr);
  const sunriseDate = createDateFromDecimalHours(solarNoon - hSunrise);
  const dhuhrDate = createDateFromDecimalHours(solarNoon + (2 / 60));
  const asrDate = createDateFromDecimalHours(solarNoon + hAsr);
  const maghribDate = createDateFromDecimalHours(solarNoon + hSunset + (2 / 60));
  const ishaDate = createDateFromDecimalHours(solarNoon + hIsha);

  const now = date.getTime();
  const schedule = [
    { key: 'fajr', time: fajrDate },
    { key: 'dhuhr', time: dhuhrDate },
    { key: 'asr', time: asrDate },
    { key: 'maghrib', time: maghribDate },
    { key: 'isha', time: ishaDate },
  ];

  let currentKey = 'isha';
  let nextKey = 'fajr';
  let nextTime = new Date(fajrDate.getTime() + 86400000);

  for (let i = 0; i < schedule.length; i++) {
    if (now < schedule[i].time.getTime()) {
      nextKey = schedule[i].key;
      nextTime = schedule[i].time;
      currentKey = i === 0 ? 'isha' : schedule[i - 1].key;
      break;
    }
  }

  const diffMs = nextTime.getTime() - now;
  const minutesUntilNext = Math.max(0, Math.floor(diffMs / (1000 * 60)));

  return {
    fajr: formatTime(fajrDate),
    sunrise: formatTime(sunriseDate),
    dhuhr: formatTime(dhuhrDate),
    asr: formatTime(asrDate),
    maghrib: formatTime(maghribDate),
    isha: formatTime(ishaDate),
    raw: {
      fajr: fajrDate,
      sunrise: sunriseDate,
      dhuhr: dhuhrDate,
      asr: asrDate,
      maghrib: maghribDate,
      isha: ishaDate
    },
    currentKey,
    nextKey,
    minutesUntilNext
  };
}

export function detectCityName(lat: number, lng: number): string {
  if (lat >= 6.7 && lat <= 7.1 && lng >= 101.0 && lng <= 101.6) return 'Pattani, TH';
  if (lat >= 5.8 && lat <= 6.7 && lng >= 100.9 && lng <= 101.6) return 'Yala, TH';
  if (lat >= 5.8 && lat <= 6.6 && lng >= 101.5 && lng <= 102.1) return 'Narathiwat, TH';
  if (lat >= 6.8 && lat <= 7.2 && lng >= 100.2 && lng <= 100.8) return 'Songkhla, TH';
  if (lat >= 13.5 && lat <= 14.0 && lng >= 100.3 && lng <= 100.8) return 'Bangkok, TH';
  if (lat >= 7.8 && lat <= 8.2 && lng >= 98.2 && lng <= 98.5) return 'Phuket, TH';
  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}
