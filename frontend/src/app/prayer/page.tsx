'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { calculateRealPrayerTimes, calculateQiblaBearing, detectCityName, PrayerTimesResult } from '@/lib/prayerCalc';
import { Compass, MapPin, RefreshCw, Navigation, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const PRESET_CITIES = [
  { name: 'Pattani (ปัตตานี)', lat: 6.8691, lng: 101.2503 },
  { name: 'Yala (ยะลา)', lat: 6.5411, lng: 101.2804 },
  { name: 'Narathiwat (นราธิวาส)', lat: 6.4255, lng: 101.8253 },
  { name: 'Songkhla (สงขลา / หาดใหญ่)', lat: 7.1988, lng: 100.5951 },
  { name: 'Bangkok (กรุงเทพฯ)', lat: 13.7563, lng: 100.5018 },
  { name: 'Phuket (ภูเก็ต)', lat: 7.8804, lng: 98.3923 },
];

export default function PrayerPage() {
  const { t } = useTranslation();

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 6.8691, lng: 101.2503 });
  const [locationName, setLocationName] = useState<string>('Pattani, TH');
  const [isUsingGPS, setIsUsingGPS] = useState<boolean>(false);
  const [loadingLoc, setLoadingLoc] = useState<boolean>(false);

  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [qiblaBearing, setQiblaBearing] = useState<number>(291.5);
  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(null);

  const fetchGPSLocation = () => {
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
      (err) => {
        console.warn('Geolocation error or denied:', err);
        setLoadingLoc(false);
        setLocationName(detectCityName(coords.lat, coords.lng));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchGPSLocation();
  }, []);

  useEffect(() => {
    const data = calculateRealPrayerTimes(coords.lat, coords.lng, new Date());
    setPrayerData(data);

    const qBearing = calculateQiblaBearing(coords.lat, coords.lng);
    setQiblaBearing(qBearing);
  }, [coords]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrayerData(calculateRealPrayerTimes(coords.lat, coords.lng, new Date()));
    }, 30000);
    return () => clearInterval(interval);
  }, [coords]);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = event.alpha || 0;
      if ((event as any).webkitCompassHeading) {
        heading = (event as any).webkitCompassHeading;
      }
      setDeviceHeading(heading);
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PRESET_CITIES.find(c => c.name === e.target.value);
    if (selected) {
      setCoords({ lat: selected.lat, lng: selected.lng });
      setLocationName(selected.name.split(' ')[0] + ', TH');
      setIsUsingGPS(false);
    }
  };

  const prayersList = [
    { key: 'fajr', time: prayerData?.fajr || '04:58 AM', name: t('prayer.fajr', 'ซุบฮี (Subh / Fajr)') },
    { key: 'dhuhr', time: prayerData?.dhuhr || '12:20 PM', name: t('prayer.dhuhr', 'ดุฮฺริ (Dhuhr)') },
    { key: 'asr', time: prayerData?.asr || '03:30 PM', name: t('prayer.asr', 'อัสริ (Asr)') },
    { key: 'maghrib', time: prayerData?.maghrib || '06:30 PM', name: t('prayer.maghrib', 'มัฆริบ (Maghrib)') },
    { key: 'isha', time: prayerData?.isha || '07:40 PM', name: t('prayer.isha', 'อิชาอ์ (Isha)') },
  ];

  // Calculate rotation & turn direction guidance
  const angleDiff = (qiblaBearing - deviceHeading + 360) % 360;
  const isAligned = angleDiff <= 8 || angleDiff >= 352;

  let turnText = '';
  let turnSubtext = '';
  let badgeStyle = '';

  if (isAligned) {
    turnText = '✨ ตรงกับทิศกิบลัตแล้ว!';
    turnSubtext = 'Aligned with Qibla (พร้อมสวดละหมาด)';
    badgeStyle = 'bg-emerald-600 text-white border-emerald-400 animate-pulse shadow-lg scale-105';
  } else if (angleDiff > 8 && angleDiff <= 180) {
    const degRight = Math.round(angleDiff);
    turnText = `➡️ หันไปทางขวาอีก ${degRight}°`;
    turnSubtext = `Turn Right ${degRight}° to align with Qibla`;
    badgeStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800';
  } else {
    const degLeft = Math.round(360 - angleDiff);
    turnText = `⬅️ หันไปทางซ้ายอีก ${degLeft}°`;
    turnSubtext = `Turn Left ${degLeft}° to align with Qibla`;
    badgeStyle = 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800';
  }

  const compassRotation = angleDiff;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 w-full space-y-6">
      
      {/* Geolocation Control Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-5 h-5 text-emerald-600 animate-bounce" />
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {t('prayer.current_location', 'ตำแหน่งของคุณ:')}
          </span>
          <span className="font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {locationName} {isUsingGPS ? '📡 (GPS)' : ''}
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
            title="Update Location from GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLoc ? 'animate-spin' : ''}`} />
            <span>{loadingLoc ? t('common.loading', 'กำลังหาพิกัด...') : t('prayer.use_gps', 'ใช้พิกัดจริง')}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Qibla Compass Card */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 flex flex-col items-center justify-between min-h-[380px] border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
              <Compass className="w-6 h-6 text-emerald-600" />
              <span>{t('prayer.qibla', 'เข็มทิศกิบลัต')}</span>
            </h2>
            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              ทิศกิบลัต: {qiblaBearing.toFixed(1)}° ({qiblaBearing.toFixed(0)}° NW ทิศตะวันตกเฉียงเหนือ)
            </p>
          </div>

          {/* Compass Dial */}
          <div className={`relative w-56 h-56 my-2 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
            isAligned 
              ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)] bg-emerald-50/70 dark:bg-emerald-950/40' 
              : 'border-emerald-500/80 shadow-inner bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30'
          }`}>
            
            {/* North, East, South, West Marks */}
            <div className="absolute top-2 text-[10px] font-extrabold text-red-500">N (เหนือ)</div>
            <div className="absolute right-3 text-[10px] font-bold text-gray-400">E</div>
            <div className="absolute bottom-2 text-[10px] font-bold text-gray-400">S</div>
            <div className="absolute left-3 text-[10px] font-bold text-gray-400">W</div>

            {/* Target Qibla Marker Badge at Top Rim */}
            <div className="absolute top-1 text-center flex flex-col items-center pointer-events-none z-10">
              <span className="text-xs">🕋</span>
            </div>

            {/* Rotating Qibla Pointer */}
            <div 
              className="w-full h-full rounded-full flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${compassRotation}deg)` }}
            >
              <div className="w-1 h-full relative">
                {/* Pointer Arrow */}
                <div className={`absolute top-3 -left-3 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent transition-all ${
                  isAligned ? 'border-b-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,1)]' : 'border-b-emerald-600 drop-shadow-md'
                }`}></div>
              </div>
            </div>

            {/* Center Kaaba Display */}
            <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl shadow-sm">🕋</span>
              <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-200 mt-1 bg-white/90 dark:bg-gray-900/90 px-2 py-0.5 rounded-full border shadow-sm">
                {qiblaBearing.toFixed(0)}° NW
              </span>
            </div>
          </div>

          {/* TURN INSTRUCTION GUIDANCE BOX */}
          <div className={`w-full p-3 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 shadow-sm ${badgeStyle}`}>
            <div className="flex items-center gap-1.5 font-extrabold text-sm">
              {isAligned ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Navigation className="w-4 h-4" />}
              <span>{turnText}</span>
            </div>
            <p className="text-[10px] opacity-90 mt-0.5 font-medium">{turnSubtext}</p>
          </div>
        </div>

        {/* Today's Real Prayer Times List */}
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
