'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import { calculateRealPrayerTimes, calculateQiblaBearing, detectCityName, PrayerTimesResult } from '@/lib/prayerCalc';
import { Compass, MapPin, RefreshCw, Navigation, CheckCircle2 } from 'lucide-react';

/* ─── Preset cities ─── */
const PRESET_CITIES = [
  { name: 'Pattani (ปัตตานี)', lat: 6.8691, lng: 101.2503 },
  { name: 'Yala (ยะลา)', lat: 6.5411, lng: 101.2804 },
  { name: 'Narathiwat (นราธิวาส)', lat: 6.4255, lng: 101.8253 },
  { name: 'Songkhla (สงขลา / หาดใหญ่)', lat: 7.1988, lng: 100.5951 },
  { name: 'Bangkok (กรุงเทพฯ)', lat: 13.7563, lng: 100.5018 },
  { name: 'Phuket (ภูเก็ต)', lat: 7.8804, lng: 98.3923 },
];

/* ─── Low-pass filter for smooth compass ─── */
function lerpAngle(current: number, target: number, factor: number): number {
  let diff = target - current;
  // Normalize to -180..+180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return (current + diff * factor + 360) % 360;
}

/* ─── Correct Great Circle Qibla Bearing ─── */
function getQiblaBearing(lat: number, lng: number): number {
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const lat1 = lat * toRad;
  const lat2 = KAABA_LAT * toRad;
  const dLng = (KAABA_LNG - lng) * toRad;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let bearing = Math.atan2(y, x) * toDeg;
  return (bearing + 360) % 360;
}

export default function PrayerPage() {
  const { t } = useTranslation();

  /* ─── Location state ─── */
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 6.8691, lng: 101.2503 });
  const [locationName, setLocationName] = useState<string>('Pattani, TH');
  const [isUsingGPS, setIsUsingGPS] = useState<boolean>(false);
  const [loadingLoc, setLoadingLoc] = useState<boolean>(false);

  /* ─── Compass state ─── */
  const [smoothHeading, setSmoothHeading] = useState<number>(0);
  const rawHeadingRef = useRef<number>(0);
  const smoothHeadingRef = useRef<number>(0);
  const hasReceivedHeading = useRef<boolean>(false);
  const animFrameRef = useRef<number>(0);
  const [compassStatus, setCompassStatus] = useState<'waiting' | 'need-permission' | 'active' | 'unavailable'>('waiting');

  /* ─── Prayer state ─── */
  const [qiblaBearing, setQiblaBearing] = useState<number>(291.5);
  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(null);

  /* ─── GPS Location ─── */
  const fetchGPSLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setIsUsingGPS(true);
        setLoadingLoc(false);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            const city = data.address?.city || data.address?.town || data.address?.province || data.address?.state;
            const country = data.address?.country_code?.toUpperCase() || 'TH';
            if (city) {
              setLocationName(`${city}, ${country}`);
            } else {
              setLocationName(detectCityName(lat, lng));
            }
          })
          .catch(() => {
            setLocationName(detectCityName(lat, lng));
          });
      },
      () => {
        setLoadingLoc(false);
        setLocationName(detectCityName(coords.lat, coords.lng));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [coords.lat, coords.lng]);

  /* ─── Device Orientation Handler ─── */
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // iOS: webkitCompassHeading gives degrees from True North (0-360, clockwise)
    if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
      heading = (event as any).webkitCompassHeading as number;
    }
    // Android: deviceorientationabsolute gives absolute alpha
    else if (event.alpha !== null && event.alpha !== undefined) {
      // alpha is 0-360 counterclockwise from North on absolute events
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null && !isNaN(heading) && isFinite(heading)) {
      rawHeadingRef.current = heading;
      if (!hasReceivedHeading.current) {
        hasReceivedHeading.current = true;
        smoothHeadingRef.current = heading;
        setCompassStatus('active');
      }
    }
  }, []);

  /* ─── Smooth animation loop using low-pass filter ─── */
  useEffect(() => {
    let running = true;

    function tick() {
      if (!running) return;
      if (hasReceivedHeading.current) {
        const smoothed = lerpAngle(smoothHeadingRef.current, rawHeadingRef.current, 0.15);
        smoothHeadingRef.current = smoothed;
        setSmoothHeading(smoothed);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  /* ─── Request compass permission (iOS 13+ needs user gesture) ─── */
  const requestCompassPermission = useCallback(() => {
    if (typeof window === 'undefined') return;

    const DOEA = DeviceOrientationEvent as any;
    if (typeof DOEA.requestPermission === 'function') {
      // iOS 13+
      DOEA.requestPermission()
        .then((state: string) => {
          if (state === 'granted') {
            setCompassStatus('active');
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setCompassStatus('unavailable');
          }
        })
        .catch(() => {
          setCompassStatus('unavailable');
        });
    }
  }, [handleOrientation]);

  /* ─── Auto-attach compass listeners on mount ─── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const DOEA = DeviceOrientationEvent as any;

    // iOS 13+ requires explicit user-gesture permission
    if (typeof DOEA.requestPermission === 'function') {
      setCompassStatus('need-permission');
      return; // user must tap the button
    }

    // Android & older iOS: just attach directly
    // Prefer deviceorientationabsolute (gives true north on Android)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    }
    // Also listen to regular deviceorientation as fallback
    window.addEventListener('deviceorientation', handleOrientation, true);

    // Give it 3 seconds to see if we get data
    const timer = setTimeout(() => {
      if (!hasReceivedHeading.current) {
        setCompassStatus('unavailable');
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  /* ─── Fetch GPS on mount ─── */
  useEffect(() => {
    fetchGPSLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Recalculate prayer times & Qibla when coords change ─── */
  useEffect(() => {
    const data = calculateRealPrayerTimes(coords.lat, coords.lng, new Date());
    setPrayerData(data);
    setQiblaBearing(getQiblaBearing(coords.lat, coords.lng));
  }, [coords]);

  /* ─── Auto-update prayer times every 30 seconds ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      setPrayerData(calculateRealPrayerTimes(coords.lat, coords.lng, new Date()));
    }, 30000);
    return () => clearInterval(interval);
  }, [coords]);

  /* ─── City selector ─── */
  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PRESET_CITIES.find(c => c.name === e.target.value);
    if (selected) {
      setCoords({ lat: selected.lat, lng: selected.lng });
      setLocationName(selected.name.split(' ')[0] + ', TH');
      setIsUsingGPS(false);
    }
  };

  /* ─── Prayer list ─── */
  const prayersList = [
    { key: 'fajr', time: prayerData?.fajr || '--:--', name: t('prayer.fajr', 'ซุบฮี (Subh / Fajr)') },
    { key: 'dhuhr', time: prayerData?.dhuhr || '--:--', name: t('prayer.dhuhr', 'ดุฮฺริ (Dhuhr)') },
    { key: 'asr', time: prayerData?.asr || '--:--', name: t('prayer.asr', 'อัสริ (Asr)') },
    { key: 'maghrib', time: prayerData?.maghrib || '--:--', name: t('prayer.maghrib', 'มัฆริบ (Maghrib)') },
    { key: 'isha', time: prayerData?.isha || '--:--', name: t('prayer.isha', 'อิชาอ์ (Isha)') },
  ];

  /* ─── Compass geometry ─── */
  const currentHeading = smoothHeading;
  const angleDiff = ((qiblaBearing - currentHeading) % 360 + 360) % 360;
  const isAligned = angleDiff <= 8 || angleDiff >= 352;
  const compassActive = compassStatus === 'active' && hasReceivedHeading.current;

  // Turn guidance
  let turnText = '';
  let turnSubtext = '';
  let badgeColor = '';

  if (!compassActive) {
    turnText = '🧭 เปิดบนมือถือเพื่อใช้เข็มทิศ';
    turnSubtext = 'Open on mobile to use live compass';
    badgeColor = 'bg-gray-100 text-gray-600 border-gray-300';
  } else if (isAligned) {
    turnText = '✨ ตรงกับทิศกิบลัตแล้ว!';
    turnSubtext = 'Aligned with Qibla — พร้อมละหมาด';
    badgeColor = 'bg-emerald-600 text-white border-emerald-400';
  } else if (angleDiff > 0 && angleDiff <= 180) {
    const deg = Math.round(angleDiff);
    turnText = `➡️ หันไปทางขวาอีก ${deg}°`;
    turnSubtext = `Turn Right ${deg}°`;
    badgeColor = 'bg-amber-50 text-amber-900 border-amber-300';
  } else {
    const deg = Math.round(360 - angleDiff);
    turnText = `⬅️ หันไปทางซ้ายอีก ${deg}°`;
    turnSubtext = `Turn Left ${deg}°`;
    badgeColor = 'bg-blue-50 text-blue-900 border-blue-300';
  }

  // CSS transform: rotate the whole dial by -heading so N follows real north
  const dialRotation = compassActive ? -currentHeading : 0;
  // The Qibla pointer rotates to qiblaBearing on the already-rotated dial
  const pointerRotation = compassActive ? (qiblaBearing - currentHeading) : qiblaBearing;

  /* ─── Compass direction label ─── */
  function dirLabel(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(((deg % 360 + 360) % 360) / 45) % 8];
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 w-full space-y-6">

      {/* ═══ Location Control Bar ═══ */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-5 h-5 text-emerald-600 animate-bounce" />
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {t('prayer.current_location', 'ตำแหน่งของคุณ:')}
          </span>
          <span className="font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {locationName} {isUsingGPS ? '📡 GPS' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            onChange={handleCitySelect}
            className="text-xs font-bold p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none cursor-pointer flex-1"
          >
            <option value="">-- {t('prayer.select_city', 'เลือกเมืองทดสอบ')} --</option>
            {PRESET_CITIES.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={fetchGPSLocation}
            disabled={loadingLoc}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLoc ? 'animate-spin' : ''}`} />
            <span>{loadingLoc ? 'กำลังหาพิกัด...' : 'ใช้พิกัดจริง'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">

        {/* ═══ Qibla Compass Card ═══ */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 flex flex-col items-center justify-between min-h-[420px] border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
              <Compass className="w-6 h-6 text-emerald-600" />
              <span>{t('prayer.qibla', 'เข็มทิศกิบลัต')}</span>
            </h2>
            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              ทิศกิบลัต: {qiblaBearing.toFixed(1)}° {dirLabel(qiblaBearing)}
            </p>

            {/* iOS permission button */}
            {compassStatus === 'need-permission' && (
              <button
                onClick={requestCompassPermission}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-full font-bold text-sm hover:bg-emerald-700 transition shadow-md active:scale-95"
              >
                🧭 แตะเพื่อเปิดเข็มทิศ (Enable Compass)
              </button>
            )}

            {/* Compass status indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${
                compassActive ? 'bg-green-500 animate-pulse' :
                compassStatus === 'unavailable' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                {compassActive ? 'เข็มทิศทำงานปกติ (Live)' :
                 compassStatus === 'need-permission' ? 'กดปุ่มด้านบนเพื่อเปิด' :
                 compassStatus === 'unavailable' ? 'ไม่พบเซนเซอร์' : 'กำลังตรวจสอบ...'}
              </span>
            </div>
          </div>

          {/* ── Compass Dial ── */}
          <div className={`relative w-64 h-64 my-3 rounded-full border-4 flex items-center justify-center overflow-hidden ${
            isAligned && compassActive
              ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] bg-emerald-50/70 dark:bg-emerald-950/40'
              : 'border-gray-300 dark:border-gray-600 bg-gradient-to-b from-gray-50 to-slate-100 dark:from-gray-800 dark:to-gray-900'
          }`}>

            {/* Tick marks every 30° */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" style={{ transform: `rotate(${dialRotation}deg)`, transition: 'none' }}>
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10;
                const isMajor = angle % 90 === 0;
                const isMid = angle % 30 === 0;
                const r1 = isMajor ? 85 : isMid ? 88 : 91;
                const r2 = 96;
                const rad = (angle - 90) * Math.PI / 180;
                return (
                  <line
                    key={i}
                    x1={100 + r1 * Math.cos(rad)}
                    y1={100 + r1 * Math.sin(rad)}
                    x2={100 + r2 * Math.cos(rad)}
                    y2={100 + r2 * Math.sin(rad)}
                    stroke={isMajor ? '#059669' : '#9CA3AF'}
                    strokeWidth={isMajor ? 2.5 : isMid ? 1.5 : 0.8}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {/* N/E/S/W labels (rotate with dial) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{ transform: `rotate(${dialRotation}deg)`, transition: 'none' }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-extrabold text-red-600">N</div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">E</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500">S</div>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">W</div>
            </div>

            {/* Qibla Arrow Pointer */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${pointerRotation}deg)`, transition: 'none' }}
            >
              <div className="w-1 h-full relative">
                {/* Arrow head */}
                <div className={`absolute top-3 -left-3 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[28px] border-l-transparent border-r-transparent ${
                  isAligned && compassActive
                    ? 'border-b-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,1)]'
                    : 'border-b-emerald-700 drop-shadow-md'
                }`} />
                {/* Thin line from center to arrow */}
                <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-0.5 bg-emerald-600/50 rounded-full" style={{ height: 'calc(50% - 30px)' }} />
              </div>
            </div>

            {/* Phone direction indicator (top) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-b-full z-10" />

            {/* Center Kaaba */}
            <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none z-10">
              <span className="text-4xl">🕋</span>
              <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-200 mt-0.5 bg-white/90 dark:bg-gray-900/90 px-2 py-0.5 rounded-full border shadow-sm">
                {qiblaBearing.toFixed(0)}° {dirLabel(qiblaBearing)}
              </span>
            </div>
          </div>

          {/* Heading readout */}
          {compassActive && (
            <p className="text-xs text-gray-500 font-mono mb-1">
              📱 ทิศที่ถือ: {Math.round(currentHeading)}° {dirLabel(currentHeading)}
            </p>
          )}

          {/* ── Turn Instruction Badge ── */}
          <div className={`w-full p-3 rounded-2xl border flex flex-col items-center text-center shadow-sm ${badgeColor} ${isAligned && compassActive ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-1.5 font-extrabold text-sm">
              {isAligned && compassActive ? <CheckCircle2 className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
              <span>{turnText}</span>
            </div>
            <p className="text-[10px] opacity-80 mt-0.5 font-medium">{turnSubtext}</p>
          </div>
        </div>

        {/* ═══ Prayer Times List ═══ */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold">{t('prayer.prayer_times', 'เวลาละหมาดประจำวัน')}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  คำนวณตามพิกัดจริง ({coords.lat.toFixed(3)}°, {coords.lng.toFixed(3)}°)
                </p>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xs bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                📍 {locationName}
              </span>
            </div>

            <div className="space-y-2.5">
              {prayersList.map((prayer) => {
                const isCurrent = prayerData?.currentKey === prayer.key;
                const isNext = prayerData?.nextKey === prayer.key;

                return (
                  <div
                    key={prayer.key}
                    className={`flex justify-between items-center p-3.5 rounded-2xl transition-all duration-300 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white font-extrabold shadow-md scale-[1.02] border-2 border-emerald-400'
                        : isNext
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{prayer.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-white text-emerald-800 px-2 py-0.5 rounded-full font-extrabold uppercase">
                          เวลาปัจจุบัน
                        </span>
                      )}
                      {isNext && !isCurrent && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                          ถัดไป ({prayerData?.minutesUntilNext} นาที)
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-mono font-bold tabular-nums">{prayer.time}</span>
                  </div>
                );
              })}
            </div>

            {prayerData && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-slate-500 font-bold">
                <span>🌅 {t('prayer.sunrise', 'อาทิตย์ขึ้น (Sunrise)')}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{prayerData.sunrise}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
