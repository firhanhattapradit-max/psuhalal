'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';

export default function PrayerPage() {
  const { t } = useTranslation();
  const [qiblaDir, setQiblaDir] = useState(0);

  const prayers = [
    { key: 'fajr', time: '05:12 AM', name: t('prayer.fajr', 'Fajr'), current: false },
    { key: 'dhuhr', time: '12:34 PM', name: t('prayer.dhuhr', 'Dhuhr'), current: true },
    { key: 'asr', time: '03:45 PM', name: t('prayer.asr', 'Asr'), current: false },
    { key: 'maghrib', time: '06:21 PM', name: t('prayer.maghrib', 'Maghrib'), current: false },
    { key: 'isha', time: '07:34 PM', name: t('prayer.isha', 'Isha'), current: false }
  ];

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compassHeading = event.alpha || 0;
      setQiblaDir(compassHeading);
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 w-full flex flex-col md:flex-row gap-6">
      {/* Qibla Compass */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 flex flex-col items-center justify-center min-h-[320px] border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>🧭</span>
          <span>{t('prayer.qibla', 'Qibla Compass')}</span>
        </h2>
        <div className="relative w-48 h-48 rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-inner bg-emerald-50/50 dark:bg-emerald-950/20">
          <div 
            className="w-full h-full rounded-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${-qiblaDir}deg)` }}
          >
            <div className="w-1 h-full bg-transparent relative">
              <div className="absolute top-2 -left-3 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-emerald-600"></div>
            </div>
          </div>
          <div className="absolute text-center">
            <span className="text-4xl">🕋</span>
          </div>
        </div>
        <p className="mt-6 text-gray-500 text-xs text-center leading-relaxed">
          {t('prayer.direction', 'Rotate your device to align with Qibla (Makkah).')}
        </p>
      </div>

      <div className="flex-1 space-y-6">
        {/* Today's Prayers */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="text-xl font-bold border-b border-gray-100 dark:border-gray-700 pb-3 flex justify-between items-center">
            <span>{t('prayer.prayer_times', "Today's Prayers")}</span>
            <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              📍 Pattani, TH
            </span>
          </h2>
          <div className="space-y-2">
            {prayers.map((prayer) => (
              <div 
                key={prayer.key}
                className={`flex justify-between items-center p-3 rounded-2xl transition ${
                  prayer.current 
                    ? 'bg-emerald-600 text-white font-bold shadow-md scale-[1.02]' 
                    : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="text-sm">{prayer.name}</span>
                <span className="text-sm font-mono">{prayer.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}