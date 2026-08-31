'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n';
import { BUS_STATIONS, ROUTE_CONNECTIONS, PROVINCE_COLORS, BusStation, Province } from '@/lib/busStations';

const LiveMap = dynamic(() => import('@/components/LiveMap').then(mod => mod.default || mod), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <p className="text-gray-500 font-medium">Loading Map...</p>
    </div>
  ),
});

const PROVINCE_NAMES: Record<Province, { th: string; en: string; emoji: string }> = {
  pattani: { th: 'ปัตตานี', en: 'Pattani', emoji: '🟢' },
  yala: { th: 'ยะลา', en: 'Yala', emoji: '🟡' },
  narathiwat: { th: 'นราธิวาส', en: 'Narathiwat', emoji: '🔵' },
};

export default function MapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapContent />
    </Suspense>
  );
}

function MapContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const provParam = searchParams.get('prov');
  
  let initialCenter: [number, number] = [6.5, 101.3]; // default middle
  let defaultZoom = 9;
  
  if (provParam === 'pattani') { initialCenter = [6.8691, 101.2503]; defaultZoom = 11; }
  else if (provParam === 'yala') { initialCenter = [6.3, 101.1]; defaultZoom = 10; }
  else if (provParam === 'narathiwat') { initialCenter = [6.1, 101.8]; defaultZoom = 10; }

  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterProvince, setFilterProvince] = useState<Province | 'all'>((provParam as Province) || 'all');
  const [searchText, setSearchText] = useState('');
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const filteredStations = BUS_STATIONS.filter(s => {
    const matchProvince = filterProvince === 'all' || s.province === filterProvince;
    const matchSearch = searchText === '' ||
      s.name_th.toLowerCase().includes(searchText.toLowerCase()) ||
      s.name_en.toLowerCase().includes(searchText.toLowerCase()) ||
      s.district.toLowerCase().includes(searchText.toLowerCase());
    return matchProvince && matchSearch;
  });

  const majorStations = filteredStations.filter(s => s.type === 'major');
  const minorStations = filteredStations.filter(s => s.type === 'minor');

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`absolute md:relative z-20 w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-extrabold text-emerald-800 dark:text-emerald-400">
              🚌 สถานี บขส. 3 จังหวัด
            </h2>
            <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 ค้นหาสถานี..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full p-2.5 text-sm font-semibold border rounded-xl dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
          />

          {/* Province Filter */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            <button
              onClick={() => setFilterProvince('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${filterProvince === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
            >
              ทั้งหมด ({BUS_STATIONS.length})
            </button>
            {(Object.entries(PROVINCE_NAMES) as [Province, typeof PROVINCE_NAMES[Province]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setFilterProvince(key)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${filterProvince === key ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                style={filterProvince === key ? { backgroundColor: PROVINCE_COLORS[key] } : {}}
              >
                {val.emoji} {val.th}
              </button>
            ))}
          </div>

          {/* Station List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {/* Major */}
            {majorStations.length > 0 && (
              <>
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-1">⭐ สถานีหลัก ({majorStations.length})</div>
                {majorStations.map(station => (
                  <StationCard key={station.id} station={station} onClick={() => setActiveStationId(station.id)} />
                ))}
              </>
            )}

            {/* Minor */}
            {minorStations.length > 0 && (
              <>
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-1 mt-3">📍 จุดจอดย่อย ({minorStations.length})</div>
                {minorStations.map(station => (
                  <StationCard key={station.id} station={station} onClick={() => setActiveStationId(station.id)} />
                ))}
              </>
            )}

            {/* Local Stops */}
            {filteredStations.filter(s => s.type === 'local_stop').length > 0 && (
              <>
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-1 mt-3">🚩 จุดจอดชุมชน / ตลาด ({filteredStations.filter(s => s.type === 'local_stop').length})</div>
                {filteredStations.filter(s => s.type === 'local_stop').map(station => (
                  <StationCard key={station.id} station={station} onClick={() => setActiveStationId(station.id)} />
                ))}
              </>
            )}

            {filteredStations.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">ไม่พบสถานีที่ค้นหา</div>
            )}
          </div>

          {/* Route summary */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">🛤️ เส้นทางหลัก</div>
            <div className="space-y-1.5">
              {ROUTE_CONNECTIONS.map(route => (
                <div key={route.id} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-1 rounded-full" style={{ backgroundColor: route.color }} />
                  <span className="font-bold text-gray-700 dark:text-gray-300">{route.name_th}</span>
                  <span className="text-gray-400 ml-auto">{route.stationIds.length} จุด</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Map ── */}
      <div className="flex-1 relative z-10 h-full">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-14 left-4 z-30 px-3.5 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md font-bold text-xs text-gray-800 dark:text-white flex items-center gap-2"
        >
          ☰ สถานี บขส.
        </button>

        <LiveMap userLocation={userLoc} initialZoom={defaultZoom} initialCenter={initialCenter} activeStationId={activeStationId} />
      </div>
    </div>
  );
}

function StationCard({ station, onClick }: { station: BusStation, onClick?: () => void }) {
  const isMajor = station.type === 'major';
  const color = PROVINCE_COLORS[station.province];

  return (
    <div
      onClick={onClick} className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${
        isMajor
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
          style={{ backgroundColor: color + '20', border: `2px solid ${color}` }}
        >
          {isMajor ? '🚏' : station.type === 'local_stop' ? '🚩' : '📍'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">{station.name_th}</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{station.district}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{station.description_th}</p>
        </div>
      </div>
    </div>
  );
}
