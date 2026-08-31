'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n';
import { BUS_STATIONS, ROUTE_CONNECTIONS, BusStation, RouteConnection, PROVINCE_COLORS } from '@/lib/busStations';
import 'leaflet/dist/leaflet.css';

export interface VehicleMarker {
  vehicle_id: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  available_seats: number;
  vehicle_type: 'van' | 'train' | 'songthaew' | 'ev_shuttle';
  route_name: string;
}

export interface POIMarker {
  id: string;
  name_th: string;
  name_ms?: string;
  name_en: string;
  name_ar?: string;
  category: 'mosque' | 'halal_restaurant' | 'station' | 'tourism_spot' | 'prayer_room';
  lat: number;
  lng: number;
  halal_cert_id?: string;
}

export interface LayerState {
  vehicles: boolean;
  mosques: boolean;
  halal_restaurants: boolean;
  stations: boolean;
  tourism_spots: boolean;
  busStations: boolean;
  routes: boolean;
}

export interface LiveMapProps {
  routeId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  locale?: 'th' | 'ms' | 'en' | 'ar';
  onVehicleClick?: (vehicle: VehicleMarker) => void;
  onPOIClick?: (poi: POIMarker) => void;
  showCheckinButton?: boolean;
  userId?: string;
  authToken?: string;
  userLocation?: { lat: number; lng: number } | null;
  activeStationId?: string | null;
}

const MapComponent = ({
  initialCenter = [6.8691, 101.2503],
  initialZoom = 9,
  onVehicleClick,
  showCheckinButton = true,
  userLocation: propUserLoc,
  activeStationId
}: LiveMapProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'th';
  const [isMounted, setIsMounted] = useState(false);

  const { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } = useMemo(
    () => ({
      MapContainer: dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false }),
      TileLayer: dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false }),
      Marker: dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false }),
      Popup: dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false }),
      Polyline: dynamic(() => import('react-leaflet').then((m) => m.Polyline), { ssr: false }),
      CircleMarker: dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false }),
    }),
    []
  );

  const L = require('leaflet');
  const { getVehicleIcon } = require('@/lib/mapUtils');
  const { useMapEvents } = require('react-leaflet');

  const [vehicles, setVehicles] = useState<Record<string, VehicleMarker>>({});
  const [pois, setPois] = useState<POIMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<BusStation | null>(null);

  const [layers, setLayers] = useState<LayerState>({
    vehicles: true,
    mosques: true,
    halal_restaurants: true,
    stations: true,
    tourism_spots: true,
    busStations: true,
    routes: true,
  });

  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const mapRef = useRef<any>(null);
  const cacheRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsMounted(true);
    if (propUserLoc) {
      setUserLocation({ lat: propUserLoc.lat, lng: propUserLoc.lng, accuracy: 10 });
    }
  }, [propUserLoc]);

  useEffect(() => {
    // Mock Vehicles
    setVehicles({
      'v102': {
        vehicle_id: 'v102', lat: 6.8100, lng: 101.2200, heading: 180, speed: 45,
        available_seats: 8, vehicle_type: 'van', route_name: 'ปัตตานี - ยะลา Express'
      },
      'v203': {
        vehicle_id: 'v203', lat: 6.4300, lng: 101.7500, heading: 270, speed: 38,
        available_seats: 5, vehicle_type: 'van', route_name: 'นราธิวาส - ยะลา'
      },
      'v305': {
        vehicle_id: 'v305', lat: 6.1500, lng: 101.1800, heading: 200, speed: 50,
        available_seats: 3, vehicle_type: 'van', route_name: 'ยะลา - เบตง'
      },
    });

    // Mock POIs
    setPois([
      // ปัตตานี
      { id: 'p1', name_th: 'มัสยิดกลางจังหวัดปัตตานี', name_ms: 'Masjid Agung Pattani', name_en: 'Pattani Central Mosque', name_ar: 'مسجد باتاني المركزي', category: 'mosque', lat: 6.862139, lng: 101.255075 },
      { id: 't1', name_th: 'ศาลเจ้าแม่ลิ้มกอเหนี่ยว', name_ms: 'Kuil Lim Ko Niao', name_en: 'Lim Ko Niao Shrine', name_ar: 'ضريح ليم كو نياو', category: 'tourism_spot', lat: 6.8719, lng: 101.2505 },
      { id: 't2', name_th: 'วัดช้างให้ (วัดราษฎร์บูรณะ)', name_ms: 'Wat Chang Hai', name_en: 'Wat Chang Hai', name_ar: 'وات تشانغ هاي', category: 'tourism_spot', lat: 6.7454, lng: 101.2675 },
      { id: 't3', name_th: 'สวนสมเด็จพระศรีนครินทร์ ปัตตานี', name_ms: 'Taman Somdet Phra Srinagarindra Pattani', name_en: 'Somdet Phra Srinagarindra Park Pattani', name_ar: 'حديقة سريناجاريندرا', category: 'tourism_spot', lat: 6.8789, lng: 101.2384 },
      { id: 't4', name_th: 'หาดตะโละกาโปร์', name_ms: 'Pantai Taloh Kapo', name_en: 'Taloh Kapo Beach', name_ar: 'شاطئ تالوه كابو', category: 'tourism_spot', lat: 6.8961, lng: 101.3740 },
      { id: 't5', name_th: 'มัสยิดกรือเซะ', name_ms: 'Masjid Kerisik', name_en: 'Krue Se Mosque', name_ar: 'مسجد كريسي', category: 'mosque', lat: 6.8731, lng: 101.3021 },
      { id: 'm1', name_th: 'มัสยิดกรือเซะริมคลอง', name_ms: 'Masjid Kerisik Tepi Sungai', name_en: 'Krue Se Riverside Mosque', name_ar: 'مسجد كريسي بجانب النهر', category: 'mosque', lat: 6.8728, lng: 101.3032 },
      
      // ยะลา
      { id: 'p2', name_th: 'มัสยิดกลางจังหวัดยะลา', name_ms: 'Masjid Agung Yala', name_en: 'Yala Central Mosque', name_ar: 'مسجد يالا المركزي', category: 'mosque', lat: 6.5410, lng: 101.2800 },
      { id: 'm2', name_th: 'มัสยิดกลางเบตง', name_ms: 'Masjid Pusat Betong', name_en: 'Betong Central Mosque', name_ar: 'مسجد بيتونج المركزي', category: 'mosque', lat: 5.7715, lng: 101.0696 },
      { id: 'm3', name_th: 'มัสยิดนูรุลยากีนเบตง', name_ms: 'Masjid Nurul Yaqin Betong', name_en: 'Nurul Yaqin Mosque Betong', name_ar: 'مسجد نور اليقين', category: 'mosque', lat: 5.7750, lng: 101.0720 },
      { id: 'm4', name_th: 'มัสยิดซอลาฮูดีน - บูเก็ตตักโกร', name_ms: 'Masjid Salahuddin Bukit Takru', name_en: 'Salahuddin Mosque Bukit Takru', name_ar: 'مسجد صلاح الدين', category: 'mosque', lat: 5.7680, lng: 101.0650 },
      { id: 't6', name_th: 'สกายวอล์คทะเลหมอกอัยเยอร์เวง', name_ms: 'Skywalk Aiyerweng', name_en: 'Aiyerweng Skywalk', name_ar: 'ممشى أيرونج', category: 'tourism_spot', lat: 5.9782, lng: 101.1820 },
      { id: 't7', name_th: 'อุโมงค์เบตงมงคลฤทธิ์', name_ms: 'Terowong Betong Mongkolrit', name_en: 'Betong Mongkolrit Tunnel', name_ar: 'نفق بيتونج', category: 'tourism_spot', lat: 5.7692, lng: 101.0717 },
      { id: 't8', name_th: 'อุโมงค์ปิยะมิตร', name_ms: 'Terowong Piyamit', name_en: 'Piyamit Tunnel', name_ar: 'نفق بياميت', category: 'tourism_spot', lat: 5.8943, lng: 101.0374 },
      { id: 't9', name_th: 'บ่อน้ำร้อนเบตง', name_ms: 'Kolam Air Panas Betong', name_en: 'Betong Hot Spring', name_ar: 'ينابيع بيتونج الحارة', category: 'tourism_spot', lat: 5.8851, lng: 101.0337 },

      // นราธิวาส
      { id: 'p3', name_th: 'มัสยิดกลางจังหวัดนราธิวาส', name_ms: 'Masjid Agung Narathiwat', name_en: 'Narathiwat Central Mosque', name_ar: 'مسجد ناراثيوات المركزي', category: 'mosque', lat: 6.4250, lng: 101.8200 },
      { id: 'm5', name_th: 'มัสยิดวาดีอัลฮูเซ็น (ตะโละมาเนาะ)', name_ms: 'Masjid Wadi al-Husein (Telok Manok)', name_en: 'Wadi al-Husein Mosque (300 Years)', name_ar: 'مسجد وادي الحسين', category: 'mosque', lat: 6.4842, lng: 101.6561 },
      { id: 't10', name_th: 'วัดเขากง (พระพุทธทักษิณมิ่งมงคล)', name_ms: 'Wat Khao Kong', name_en: 'Wat Khao Kong', name_ar: 'وات خاو كونج', category: 'tourism_spot', lat: 6.3702, lng: 101.7902 },
      { id: 't11', name_th: 'หาดนราทัศน์', name_ms: 'Pantai Narathat', name_en: 'Narathat Beach', name_ar: 'شاطئ ناراثات', category: 'tourism_spot', lat: 6.4447, lng: 101.8315 },
      { id: 't12', name_th: 'วัดชลธาราสิงเห', name_ms: 'Wat Chonthara Singhe', name_en: 'Wat Chonthara Singhe', name_ar: 'وات تشونثارا سينغه', category: 'tourism_spot', lat: 6.2624, lng: 102.0503 },

      // ร้านอาหารฮาลาล - ปัตตานี
      { id: 'r1', name_th: 'The Pattanion (เดอะ ปัตตาเนี่ยน)', name_en: 'The Pattanion', category: 'halal_restaurant', lat: 6.8661, lng: 101.2612 },
      { id: 'r2', name_th: 'ร้านแบมะ ซุป อาหารตามสั่ง เจ้าเก่า', name_en: 'Bae Ma Soup', category: 'halal_restaurant', lat: 6.8685, lng: 101.2501 },
      { id: 'r3', name_th: 'โรตีดีฟอเรส ปัตตานี', name_en: 'Roti De Forest Pattani', category: 'halal_restaurant', lat: 6.8778, lng: 101.2335 },
      { id: 'r4', name_th: 'กะมา ข้าวยำราชา', name_en: 'Ka Ma Khao Yam Racha', category: 'halal_restaurant', lat: 6.8722, lng: 101.2589 },
      { id: 'r5', name_th: 'ไก่กอและ กะเมาะ รามโกมุท ซอย 4', name_en: 'Golek Chicken Ka Moh', category: 'halal_restaurant', lat: 6.8711, lng: 101.2600 },
      { id: 'r6', name_th: 'ซุปเจ๊ะเยาะ เจ้าเก่า', name_en: 'Soup Jeh Yoh', category: 'halal_restaurant', lat: 6.8690, lng: 101.2550 },
      { id: 'r7', name_th: 'ร้านบังหนูด', name_en: 'Bang Nud Restaurant', category: 'halal_restaurant', lat: 6.8640, lng: 101.2520 },

      // ร้านอาหารฮาลาล - ยะลา
      { id: 'r8', name_th: 'ร้าน Kin-D (กินดี) Restaurant', name_en: 'Kin-D Restaurant', category: 'halal_restaurant', lat: 6.5441, lng: 101.2934 },
      { id: 'r9', name_th: 'ร้านมาอิดะฮ์ ข้าวหมกอาหรับ', name_en: 'Maidah Arab Biryani', category: 'halal_restaurant', lat: 6.5398, lng: 101.2825 },
      { id: 'r10', name_th: 'ข้าวต้มมาอิดะฮ์ ฮาลาล ยะลา', name_en: 'Maidah Halal Porridge Yala', category: 'halal_restaurant', lat: 6.5399, lng: 101.2826 },
      { id: 'r11', name_th: 'Makan Shabu&Grill YALA', name_en: 'Makan Shabu & Grill', category: 'halal_restaurant', lat: 6.5413, lng: 101.2954 },
      { id: 'r12', name_th: 'ฮาลาล ฮานตาน่า (HANTANA)', name_en: 'HANTANA Halal', category: 'halal_restaurant', lat: 6.5420, lng: 101.2900 },
      { id: 'r13', name_th: 'ร้านข้าวมันไก่เบตง (ฮาลาล)', name_en: 'Betong Chicken Rice Halal', category: 'halal_restaurant', lat: 5.7725, lng: 101.0700 },

      // ร้านอาหารฮาลาล - นราธิวาส
      { id: 'r14', name_th: 'อาคูว', name_en: 'AKHOO', category: 'halal_restaurant', lat: 6.4445, lng: 101.8153 },
      { id: 'r15', name_th: 'สุขสันต์ SookSaan', name_en: 'SookSaan', category: 'halal_restaurant', lat: 6.4172, lng: 101.8021 },
      { id: 'r16', name_th: 'โก๋วัง นราธิวาส', name_en: 'Ko Wang Narathiwat', category: 'halal_restaurant', lat: 6.4357, lng: 101.8252 },
      { id: 'r17', name_th: 'ยะกังโภชนา', name_en: 'Yakang Pochana', category: 'halal_restaurant', lat: 6.4210, lng: 101.8200 },
      { id: 'r18', name_th: 'ร้านโรตีริมหาดนราทัศน์', name_en: 'Narathat Beach Roti', category: 'halal_restaurant', lat: 6.4450, lng: 101.8310 },
      { id: 'r19', name_th: 'ร้านนาซิดาแฆ กะต๊ะ', name_en: 'Nasi Dagang Ka Ta', category: 'halal_restaurant', lat: 6.4300, lng: 101.8250 },
    ]);
  }, []);

  
  useEffect(() => {
    if (activeStationId && mapRef.current) {
      const station = BUS_STATIONS.find(s => s.id === activeStationId);
      if (station) {
        mapRef.current.flyTo([station.lat, station.lng], 15, { duration: 1.5 });
        setSelectedStation(station);
      }
    }
  }, [activeStationId]);

  const MapEventHandler = () => {
    const map = useMapEvents({
      moveend: () => {
        const center = map.getCenter();
        const key = `${center.lat.toFixed(2)},${center.lng.toFixed(2)}`;
        cacheRef.current.add(key);
      }
    });
    useEffect(() => { mapRef.current = map; }, [map]);
    return null;
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }
  };

  const flyToStation = (station: BusStation) => {
    setSelectedStation(station);
    if (mapRef.current) {
      mapRef.current.flyTo([station.lat, station.lng], 14, { duration: 1 });
    }
  };

  const getPoiName = (poi: POIMarker) => {
    if (currentLang === 'th') return poi.name_th;
    if (currentLang === 'ms') return poi.name_ms;
    if (currentLang === 'ar') return poi.name_ar;
    return poi.name_en;
  };

  // Get route line coordinates
  const getRouteCoords = (route: RouteConnection): [number, number][] => {
    return route.stationIds
      .map(id => BUS_STATIONS.find(s => s.id === id))
      .filter((s): s is BusStation => !!s)
      .map(s => [s.lat, s.lng] as [number, number]);
  };

  // Create station icon
  const createStationIcon = (station: BusStation) => {
    const isMajor = station.type === 'major';
    const isLocal = station.type === 'local_stop';
    const color = PROVINCE_COLORS[station.province];
    const size = isMajor ? 36 : isLocal ? 20 : 26;
    const emoji = isMajor ? '🚏' : isLocal ? '🚩' : '📍';
    const borderWidth = isMajor ? 3 : isLocal ? 1.5 : 2;

    return L.divIcon({
      className: 'bus-station-icon',
      html: `<div style="
        width: ${size}px; height: ${size}px;
        display: flex; align-items: center; justify-content: center;
        background: white; border-radius: 50%;
        border: ${borderWidth}px solid ${color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: ${isMajor ? '18px' : '13px'};
        cursor: pointer;
        ${isMajor ? 'animation: pulse 2s infinite;' : ''}
      ">${emoji}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  // Filtered routes
  const visibleRoutes = selectedRoute
    ? ROUTE_CONNECTIONS.filter(r => r.id === selectedRoute)
    : ROUTE_CONNECTIONS;

  if (!isMounted) return <div className="w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-gray-500 font-bold">{t('common.loading', 'Loading Map...')}</div>;

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">

      {/* ── Top Banner: Route Stats ── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-emerald-700 to-teal-800 text-white py-2 px-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚌</span>
          <span className="font-bold text-xs">
            {t('map.transit_hub', 'Transit Hub')} — 3 จังหวัดชายแดนใต้
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-emerald-500/30 px-2 py-0.5 rounded-lg font-bold">🟢 {BUS_STATIONS.filter(s => s.type === 'major').length} สถานีหลัก</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg font-bold">📍 {BUS_STATIONS.filter(s => s.type === 'minor').length} จุดจอดย่อย</span>
        </div>
      </div>

      {/* ── Layer Controls ── */}
      <div className="absolute top-14 right-4 z-[1000] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-2.5 flex flex-col transition-all duration-300 w-48">
        <button 
          onClick={() => setIsLayersOpen(!isLayersOpen)} 
          className="flex justify-between items-center w-full px-2 py-1"
        >
          <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">LAYERS</span>
          <span className="text-gray-400 text-xs">{isLayersOpen ? '▼' : '▶'}</span>
        </button>
        
        <div className={`flex flex-col space-y-1 transition-all duration-300 overflow-hidden ${isLayersOpen ? 'opacity-100 max-h-[500px] mt-2' : 'opacity-0 max-h-0 mt-0'}`}>
          {[
            { key: 'busStations', icon: '🚏', label: 'สถานี บขส.' },
            { key: 'routes', icon: '🛤️', label: 'เส้นทาง' },
            { key: 'vehicles', icon: '🚌', label: 'รถโดยสาร' },
            { key: 'mosques', icon: '🕌', label: 'มัสยิด' },
            { key: 'halal_restaurants', icon: '🍽️', label: 'ร้านอาหารฮาลาล' },
            { key: 'tourism_spots', icon: '🏞️', label: 'สถานที่ท่องเที่ยว' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setLayers(prev => ({ ...prev, [key]: !prev[key as keyof LayerState] }))}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
                layers[key as keyof LayerState]
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

          {/* Route filter */}
          <div className="px-2">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">เส้นทาง</div>
            <select
              value={selectedRoute || ''}
              onChange={(e) => setSelectedRoute(e.target.value || null)}
              className="w-full text-[11px] font-bold p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
            >
              <option value="">ทุกเส้นทาง</option>
              {ROUTE_CONNECTIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name_th}</option>
              ))}
            </select>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

          <button
            onClick={() => setMapType(prev => prev === 'street' ? 'satellite' : 'street')}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition"
          >
            <span>🗺️</span>
            <span>{mapType === 'street' ? 'ดาวเทียม' : 'ถนน'}</span>
          </button>
        </div>
      </div>

      {/* ── Map ── */}
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <MapEventHandler />

        {mapType === 'street' ? (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        ) : (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Tiles &copy; Esri' />
        )}

        {/* User Location */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location',
              html: `<div class="relative flex items-center justify-center w-6 h-6"><div class="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75"></div><div class="relative w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-md"></div></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          />
        )}

        {/* ── Route Lines ── */}
        {layers.routes && visibleRoutes.map(route => (
          <Polyline
            key={route.id}
            positions={getRouteCoords(route)}
            pathOptions={{
              color: route.color,
              weight: 4,
              opacity: 0.7,
              dashArray: '8, 6',
            }}
          >
            <Popup>
              <div className="p-2 font-sans text-center">
                <h3 className="font-bold text-sm">{route.name_th}</h3>
                <p className="text-xs text-gray-500">{route.name_en}</p>
                <p className="text-xs text-gray-400 mt-1">{route.stationIds.length} สถานี</p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* ── Bus Station Markers ── */}
        {layers.busStations && BUS_STATIONS.map(station => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={createStationIcon(station)}
            eventHandlers={{
              click: () => setSelectedStation(station),
            }}
          >
            <Popup maxWidth={300}>
              <div className="p-2 font-sans w-64">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{station.type === 'major' ? '🚏' : '📍'}</span>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{station.name_th}</h3>
                    <p className="text-[10px] text-gray-500">{station.name_en}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-gray-600">📍 อำเภอ:</span>
                    <span className="text-gray-800">{station.district}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-gray-600">ℹ️ รายละเอียด:</span>
                    <span className="text-gray-700">{station.description_th}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-gray-600">🔗 เชื่อมต่อ:</span>
                    <span className="text-emerald-700 font-bold">{station.connections.length} สถานี</span>
                  </div>
                  {station.type === 'major' && (
                    <div className="mt-2 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-lg text-center border border-emerald-200">
                      ⭐ สถานีขนส่งหลัก
                    </div>
                  )}
                </div>
                {showCheckinButton && (
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-1">
                      📍 Check In
                    </button>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1">
                      🗺️ นำทาง
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── Vehicle Markers ── */}
        {layers.vehicles && Object.values(vehicles).map(vehicle => (
          <Marker
            key={vehicle.vehicle_id}
            position={[vehicle.lat, vehicle.lng]}
            icon={getVehicleIcon(vehicle.vehicle_type, vehicle.heading)}
            eventHandlers={{ click: () => onVehicleClick?.(vehicle) }}
          >
            <Popup>
              <div className="p-2 w-48 font-sans">
                <div className="font-bold text-base mb-1 text-slate-900">{vehicle.route_name}</div>
                <div className="text-xs text-gray-500 mb-2">Type: {vehicle.vehicle_type.toUpperCase()}</div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-xs font-bold text-gray-600">ความเร็ว:</span>
                  <span className="text-xs font-extrabold text-emerald-700">{Math.round(vehicle.speed)} km/h</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-1">
                  <span className="text-xs font-bold text-gray-600">ที่นั่งว่าง:</span>
                  <span className={`text-xs font-extrabold ${vehicle.available_seats > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {vehicle.available_seats}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── POI Markers ── */}
        {pois.map(poi => {
          const isVisible = layers[poi.category === 'mosque' ? 'mosques' : poi.category === 'halal_restaurant' ? 'halal_restaurants' : poi.category === 'tourism_spot' ? 'tourism_spots' : 'stations'] as boolean;
          if (!isVisible) return null;
          
          // Create custom icon for POIs
          const iconEmoji = poi.category === 'mosque' ? '🕌' : poi.category === 'tourism_spot' ? '🏞️' : '🍽️';
          const poiIcon = L.divIcon({
            className: 'poi-icon',
            html: `<div style="
              width: 28px; height: 28px;
              display: flex; align-items: center; justify-content: center;
              background: white; border-radius: 50%;
              border: 2px solid ${poi.category === 'mosque' ? '#10b981' : poi.category === 'tourism_spot' ? '#3b82f6' : '#f59e0b'};
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-size: 14px;
            ">${iconEmoji}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          return (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={poiIcon}>
              <Popup>
                <div className="p-2 text-center font-sans min-w-[150px]">
                  <h3 className="font-bold text-sm text-gray-900 mb-2">{getPoiName(poi)}</h3>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm">
                    🗺️ นำทาง
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ── Map Controls (Bottom Right) ── */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col space-y-2">
        <button onClick={centerOnUser} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-emerald-600 hover:bg-gray-50 transition border border-gray-200 dark:border-gray-700" title="ตำแหน่งของฉัน">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button onClick={() => mapRef.current?.zoomIn()} className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 font-bold text-lg border-b border-gray-200 dark:border-gray-700">+</button>
          <button onClick={() => mapRef.current?.zoomOut()} className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 font-bold text-lg">-</button>
        </div>
      </div>

      {/* ── Station Legend (Bottom Left) ── */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-[10px] space-y-1.5 max-w-[200px]">
        <div className="font-extrabold text-gray-500 uppercase tracking-wider mb-1">สัญลักษณ์</div>
        <div className="flex items-center gap-2"><span className="text-sm">🚏</span><span className="font-bold text-gray-700">สถานี บขส. หลัก</span></div>
        <div className="flex items-center gap-2"><span className="text-sm">📍</span><span className="font-bold text-gray-700">จุดจอดย่อย / คิวรถตู้</span></div>
        <div className="flex items-center gap-2"><span className="text-xs">🚩</span><span className="font-bold text-gray-700">จุดจอดชุมชน / ตลาด</span></div>
        <div className="h-px bg-gray-200 dark:bg-gray-700" />
        {ROUTE_CONNECTIONS.slice(0, 5).map(r => (
          <div key={r.id} className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => setSelectedRoute(selectedRoute === r.id ? null : r.id)}>
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: r.color, border: `1px dashed ${r.color}` }} />
            <span className="font-bold text-gray-600">{r.name_th}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LiveMap = MapComponent;
export default LiveMap;
