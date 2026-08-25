'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface CompassProps {
  userLat: number;
  userLng: number;
  locale?: 'th' | 'ms' | 'en' | 'ar';
}

interface PrayerTimesDisplay {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface DeviceOrientation {
  alpha: number | null; // compass heading
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
}

const KAABA_LAT = 21.422487; // Updated Kaaba coordinates for better accuracy
const KAABA_LNG = 39.826206;

// Helper: Calculate Great Circle Bearing
function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Helper: Haversine Distance (km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function QiblaCompass({ userLat, userLng, locale = 'en' }: CompassProps) {
  const isRTL = locale === 'ar';
  
  const [view, setView] = useState<'compass' | 'prayer'>('compass');
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaDir, setQiblaDir] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [accuracy, setAccuracy] = useState<'high' | 'low' | 'none'>('none');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesDisplay | null>(null);
  const [loadingPrayers, setLoadingPrayers] = useState(true);

  // Compass Logic
  useEffect(() => {
    if (userLat && userLng) {
      setQiblaDir(getBearing(userLat, userLng, KAABA_LAT, KAABA_LNG));
      setDistance(getDistance(userLat, userLng, KAABA_LAT, KAABA_LNG));
    }
  }, [userLat, userLng]);

  const requestAccess = useCallback(() => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            setPermissionGranted(true);
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setPermissionGranted(false);
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS 13+ devices
      setPermissionGranted(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      // Fallback
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }, []);

  useEffect(() => {
    // Check if permission is already granted or not needed
    if (!('DeviceOrientationEvent' in window)) {
      setPermissionGranted(false);
    }
    
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const handleOrientation = (event: any) => {
    let compassHeading = event.webkitCompassHeading;
    let isAbsolute = event.absolute;

    if (compassHeading !== undefined && compassHeading !== null) {
      // iOS
      setHeading(compassHeading);
      setAccuracy('high');
    } else if (event.alpha !== null) {
      // Android
      if (isAbsolute || event.type === 'deviceorientationabsolute') {
        let alpha = event.alpha;
        let heading = 360 - alpha;
        setHeading(heading);
        setAccuracy('high');
      } else {
        // Approximate / non-absolute
        let heading = 360 - event.alpha;
        setHeading(heading);
        setAccuracy('low');
      }
    }
  };

  // Prayer Times Fetching
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoadingPrayers(true);
      try {
        // Mocking API call for demonstration. Replace with actual API endpoint
        // const res = await fetch(`/api/prayer-times?lat=${userLat}&lng=${userLng}`);
        // const data = await res.json();
        
        // Mock data
        setTimeout(() => {
          setPrayerTimes({
            fajr: '05:12',
            sunrise: '06:30',
            dhuhr: '12:45',
            asr: '15:50',
            maghrib: '18:25',
            isha: '19:40',
          });
          setLoadingPrayers(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to fetch prayer times', err);
        setLoadingPrayers(false);
      }
    };

    if (userLat && userLng && view === 'prayer') {
      fetchPrayerTimes();
    }
  }, [userLat, userLng, view]);

  const getDirectionText = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
    return directions[index];
  };

  const needleRotation = heading !== null ? qiblaDir - heading : qiblaDir;
  const compassRotation = heading !== null ? -heading : 0;

  const renderCompass = () => (
    <div className="flex flex-col items-center py-6">
      {!permissionGranted && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg text-yellow-800 text-center max-w-sm">
          <p className="mb-3 text-sm">Compass access required for live rotation.</p>
          <button 
            onClick={requestAccess}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-emerald-700 transition-colors"
          >
            Enable Compass
          </button>
        </div>
      )}

      <div className="relative w-[300px] h-[300px] mb-8">
        {/* Outer compass ring */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-emerald-900 shadow-xl transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${compassRotation}deg)` }}
        >
          {/* Degree markings & Labels */}
          <div className="w-full h-full relative text-emerald-900 font-bold text-sm">
            <span className="absolute top-2 left-1/2 -translate-x-1/2">N</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2">S</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2">E</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2">W</span>
            <span className="absolute top-10 right-10">NE</span>
            <span className="absolute bottom-10 right-10">SE</span>
            <span className="absolute bottom-10 left-10">SW</span>
            <span className="absolute top-10 left-10">NW</span>
          </div>
          
          {/* Islamic geometric pattern (simplified SVG background) */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
            <polygon points="50,0 100,50 50,100 0,50" fill="currentColor" />
            <polygon points="15,15 85,15 85,85 15,85" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45 50 50)" />
          </svg>
        </div>

        {/* Qibla Needle */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        >
          {/* Arrow pointing to Kaaba */}
          <div className="h-full py-4 flex flex-col items-center justify-start">
            <div className="text-3xl filter drop-shadow-md relative z-10">🕋</div>
            <div className="w-1 h-1/2 bg-gradient-to-t from-transparent via-emerald-500 to-emerald-600 rounded-full -mt-2"></div>
          </div>
        </div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-emerald-800 rounded-full shadow-inner border-2 border-white z-20"></div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-emerald-900 mb-1 flex items-center justify-center gap-2">
          {heading !== null ? Math.round((heading + qiblaDir) % 360) : Math.round(qiblaDir)}°
          <span className="text-xl text-emerald-700">
            {getDirectionText(heading !== null ? (heading + qiblaDir) % 360 : qiblaDir)}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${accuracy === 'high' ? 'bg-green-500' : accuracy === 'low' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {accuracy === 'high' ? 'Calibrated' : accuracy === 'low' ? 'Approximate' : 'No Sensor'}
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          {distance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km from Makkah al-Mukarramah
        </p>
      </div>
    </div>
  );

  const renderPrayerTimes = () => {
    const prayers = [
      { id: 'fajr', en: 'Fajr', ar: 'الفجر', th: 'ซุบฮ์', time: prayerTimes?.fajr },
      { id: 'sunrise', en: 'Sunrise', ar: 'الشروق', th: 'ชุรูก', time: prayerTimes?.sunrise },
      { id: 'dhuhr', en: 'Dhuhr', ar: 'الظهر', th: 'ซุฮ์ริ', time: prayerTimes?.dhuhr },
      { id: 'asr', en: 'Asr', ar: 'العصر', th: 'อัสร์', time: prayerTimes?.asr },
      { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', th: 'มัฆริบ', time: prayerTimes?.maghrib },
      { id: 'isha', en: 'Isha', ar: 'العشاء', th: 'อิชาอ์', time: prayerTimes?.isha },
    ];

    if (loadingPrayers) {
      return <div className="p-8 text-center text-emerald-700 animate-pulse">Loading prayer times...</div>;
    }

    // Determine next prayer (simplified logic for styling)
    const nextPrayerId = 'asr'; 
    const currentPrayerId = 'dhuhr';

    return (
      <div className="w-full max-w-md mx-auto py-4 space-y-3">
        {prayers.map((prayer) => {
          const isNext = prayer.id === nextPrayerId;
          const isCurrent = prayer.id === currentPrayerId;
          
          return (
            <div 
              key={prayer.id}
              className={`flex items-center justify-between p-4 rounded-xl shadow-sm border
                ${isNext ? 'border-orange-300 bg-orange-50' : 
                  isCurrent ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100 bg-white'}`}
            >
              <div className="flex flex-col">
                <span className={`text-xl font-bold font-arabic mb-1 ${isNext ? 'text-orange-700' : 'text-emerald-900'}`}>
                  {prayer.ar}
                </span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {prayer.en} • {prayer.th}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-2xl font-bold ${isNext ? 'text-orange-600' : 'text-gray-800'}`}>
                  {prayer.time}
                </span>
                {isNext && <span className="text-xs text-orange-600 font-medium">Next in 45m</span>}
                {isCurrent && <span className="text-xs text-emerald-600 font-medium">Current</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 text-8xl -mt-6 -mr-6 font-arabic select-none">
          القبلة
        </div>
        <h2 className="text-2xl font-bold mb-1 relative z-10">Qibla & Prayer Times</h2>
        <p className="text-emerald-100 text-sm relative z-10 font-arabic text-lg">
          اتجاه القبلة ومواقيت الصلاة
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex p-2 bg-gray-50 border-b border-gray-100">
        <button
          onClick={() => setView('compass')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            view === 'compass' 
              ? 'bg-white text-emerald-800 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Compass
        </button>
        <button
          onClick={() => setView('prayer')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            view === 'prayer' 
              ? 'bg-white text-emerald-800 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Prayer Times
        </button>
      </div>

      {/* Content */}
      <div className="p-4 bg-gray-50/50 min-h-[400px]">
        {view === 'compass' ? renderCompass() : renderPrayerTimes()}
      </div>
    </div>
  );
}
