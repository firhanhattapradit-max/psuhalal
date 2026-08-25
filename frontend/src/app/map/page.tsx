'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n';

// Dynamically import the map to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap').then(mod => mod.default || mod), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <p className="text-gray-500 font-medium">Loading Map...</p>
    </div>
  ),
});

export default function MapPage() {
  const { t } = useTranslation();
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err)
      );
    }
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`absolute md:relative z-20 w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-400">
              🛺 {t('map.transit_hub', 'Transit Hub')}
            </h2>
            <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              {t('map.select_route', 'Select Route')}
            </label>
            <select className="w-full p-2.5 text-sm font-semibold border rounded-xl dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Pattani Central - Yala (ปัตตานี - ยะลา)</option>
              <option>Narathiwat City Loop (สายเมืองนราธิวาส)</option>
              <option>Airport Shuttle (รถรับส่งสนามบิน)</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">🚌 {t('map.vehicle_num', 'Vehicle #102')}</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                {t('map.eta_desc', 'ETA: 5 mins (1.2km away)')}
              </p>
            </div>
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm">🕌 {t('prayer.next_prayer', 'Next Prayer')}: {t('prayer.asr', 'Asr')}</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">
                {t('map.starts_in', 'Starts in 45 mins')}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold transition shadow-md flex items-center justify-center gap-2">
              <span>📍</span>
              <span>{t('map.quick_checkin', 'Quick Check-in (Scan QR)')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Map Container */}
      <div className="flex-1 relative z-10 h-full">
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-30 px-3.5 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md font-bold text-xs text-gray-800 dark:text-white flex items-center gap-2"
        >
          ☰ {t('map.transit_hub', 'Transit Hub')}
        </button>
        
        {/* Route Selector Dropdown on top of map */}
        <div className="hidden md:flex absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700 items-center gap-2 text-xs">
          <span className="font-bold text-gray-600 dark:text-gray-300">{t('map.quick_filter', 'Quick Filter:')}</span>
          <select className="border-none bg-transparent outline-none cursor-pointer font-bold text-emerald-700 dark:text-emerald-400">
            <option>{t('map.all_vehicles', 'All Vehicles')}</option>
            <option>{t('map.mosques', 'Mosques')}</option>
            <option>{t('map.halal_food', 'Halal Food')}</option>
          </select>
        </div>

        <LiveMap userLocation={userLoc} />
      </div>
    </div>
  );
}
