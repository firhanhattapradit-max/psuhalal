'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n';
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
  interpolating?: boolean;
  targetLat?: number;
  targetLng?: number;
}

export interface POIMarker {
  id: string;
  name_th: string;
  name_ms: string;
  name_en: string;
  name_ar: string;
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
  checkin_points: boolean;
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
}

const MapComponent = ({
  routeId,
  initialCenter = [6.8691, 101.2503],
  initialZoom = 13,
  onVehicleClick,
  onPOIClick,
  showCheckinButton = true,
  userId,
  authToken,
  userLocation: propUserLoc
}: LiveMapProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'th';
  const [isMounted, setIsMounted] = useState(false);
  
  const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = useMemo(
    () => ({
      MapContainer: dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false }),
      TileLayer: dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false }),
      Marker: dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false }),
      Popup: dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false }),
      useMapEvents: require('react-leaflet').useMapEvents,
    }),
    []
  );

  const L = require('leaflet');
  const { getVehicleIcon } = require('@/lib/mapUtils');
  
  const [vehicles, setVehicles] = useState<Record<string, VehicleMarker>>({});
  const [pois, setPois] = useState<POIMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null);
  
  const [layers, setLayers] = useState<LayerState>({
    vehicles: true,
    mosques: true,
    halal_restaurants: true,
    stations: true,
    tourism_spots: true,
    checkin_points: true,
  });

  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [nextPrayer, setNextPrayer] = useState({ name: 'Asr', time: '15:30', countdown: '00:45:12' });
  const [checkinModal, setCheckinModal] = useState<{
    show: boolean;
    poi: POIMarker | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    points: number;
  }>({
    show: false,
    poi: null,
    status: 'idle',
    points: 0,
  });

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
        vehicle_id: 'v102',
        lat: 6.8691,
        lng: 101.2503,
        heading: 45,
        speed: 42,
        available_seats: 8,
        vehicle_type: 'van',
        route_name: 'Pattani - Yala Express'
      }
    });

    // Mock POIs
    setPois([
      {
        id: 'p1',
        name_th: 'มัสยิดกลางจังหวัดปัตตานี',
        name_ms: 'Masjid Agung Pattani',
        name_en: 'Pattani Central Mosque',
        name_ar: 'مسجد باتاني المركزي',
        category: 'mosque',
        lat: 6.8671,
        lng: 101.2530,
        halal_cert_id: 'CERT-001'
      },
      {
        id: 'p2',
        name_th: 'ร้านข้าวยำฟาติมะฮ์',
        name_ms: 'Restoran Nasi Kerabu Fatimah',
        name_en: 'Fatimah Nasi Kerabu Restaurant',
        name_ar: 'مطعم ناسي كرابو فاطمة',
        category: 'halal_restaurant',
        lat: 6.8710,
        lng: 101.2480,
        halal_cert_id: 'CERT-002'
      }
    ]);
  }, []);

  const handleCheckIn = async () => {
    if (!checkinModal.poi) return;
    setCheckinModal(prev => ({ ...prev, status: 'loading' }));
    setTimeout(() => {
      setCheckinModal(prev => ({ ...prev, status: 'success', points: 50 }));
      setTimeout(() => {
        setCheckinModal({ show: false, poi: null, status: 'idle', points: 0 });
      }, 2500);
    }, 1200);
  };

  const MapEventHandler = () => {
    const map = useMapEvents({
      moveend: () => {
        const center = map.getCenter();
        const key = `${center.lat.toFixed(2)},${center.lng.toFixed(2)}`;
        if (!cacheRef.current.has(key)) {
          cacheRef.current.add(key);
        }
      }
    });

    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
    }
  };

  if (!isMounted) return <div className="w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-gray-500 font-bold">{t('common.loading', 'Loading Map...')}</div>;

  const getPoiName = (poi: POIMarker) => {
    if (currentLang === 'th') return poi.name_th;
    if (currentLang === 'ms') return poi.name_ms;
    if (currentLang === 'ar') return poi.name_ar;
    return poi.name_en;
  };

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
      
      {/* Prayer Time Banner */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-2 px-4 shadow-md flex justify-between items-center backdrop-blur-sm opacity-95">
        <div className="flex items-center space-x-3">
          <span className="text-xl md:text-2xl font-arabic">اَلصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ</span>
          <span className="font-bold text-xs md:text-sm px-2.5 py-1 bg-white/20 rounded-lg">
            {t('prayer.next_prayer', 'Next Prayer')}: {t(`prayer.${nextPrayer.name.toLowerCase()}`, nextPrayer.name)} {nextPrayer.time}
          </span>
        </div>
        <div className="font-mono font-extrabold text-sm md:text-base bg-black/20 px-3 py-1 rounded-lg">{nextPrayer.countdown}</div>
      </div>

      {/* Map Layers Controller */}
      <div className="absolute top-16 right-4 z-[1000] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-2.5 flex flex-col space-y-1">
        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 px-2">
          {t('map.layer_control', 'LAYERS')}
        </div>
        {[
          { key: 'vehicles', icon: '🚌', label: t('map.vehicles', 'Vehicles') },
          { key: 'mosques', icon: '🕌', label: t('map.mosques', 'Mosques') },
          { key: 'halal_restaurants', icon: '🍽️', label: t('map.halal_food', 'Halal Food') },
          { key: 'stations', icon: '🚏', label: t('map.bus_stops', 'Stops') },
          { key: 'tourism_spots', icon: '🏔️', label: t('map.tourism', 'Tourism') },
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
        
        <div className="h-px bg-gray-200 dark:bg-gray-800 my-1"></div>
        
        <button
          onClick={() => setMapType(prev => prev === 'street' ? 'satellite' : 'street')}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition"
        >
          <span>🗺️</span>
          <span>{mapType === 'street' ? t('map.satellite_view', 'Satellite View') : 'Street View'}</span>
        </button>
      </div>

      {/* Map Container */}
      <MapContainer 
        center={initialCenter} 
        zoom={initialZoom} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <MapEventHandler />
        
        {mapType === 'street' ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri'
          />
        )}

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

        {layers.vehicles && Object.values(vehicles).map((vehicle) => (
          <Marker
            key={vehicle.vehicle_id}
            position={[vehicle.lat, vehicle.lng]}
            icon={getVehicleIcon(vehicle.vehicle_type, vehicle.heading)}
            eventHandlers={{
              click: () => onVehicleClick?.(vehicle)
            }}
          >
            <Popup className="rounded-xl shadow-lg">
              <div className="p-2 w-48 font-sans">
                <div className="font-bold text-base mb-1 text-slate-900">{vehicle.route_name}</div>
                <div className="text-xs text-gray-500 mb-2">Type: {vehicle.vehicle_type.toUpperCase()}</div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-xs font-bold text-gray-600">{t('map.speed', 'Speed:')}</span>
                  <span className="text-xs font-extrabold text-emerald-700">{Math.round(vehicle.speed)} km/h</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-1">
                  <span className="text-xs font-bold text-gray-600">{t('map.available_seats', 'Available Seats:')}</span>
                  <span className={`text-xs font-extrabold ${vehicle.available_seats > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {vehicle.available_seats}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {pois.map(poi => (
          (layers[poi.category === 'mosque' ? 'mosques' : poi.category === 'halal_restaurant' ? 'halal_restaurants' : 'stations'] as boolean) && (
            <Marker key={poi.id} position={[poi.lat, poi.lng]}>
              <Popup>
                <div className="p-2 text-center font-sans">
                  <h3 className="font-bold text-sm text-gray-900">{getPoiName(poi)}</h3>
                  {showCheckinButton && (
                    <button 
                      onClick={() => setCheckinModal({ show: true, poi, status: 'idle', points: 0 })}
                      className="mt-2 w-full bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                    >
                      📍 {t('gamification.check_in', 'Check In')}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Custom Map Controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col space-y-2">
        <button onClick={centerOnUser} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 transition border border-gray-200 dark:border-gray-700" title={t('map.locate_me', 'Locate Me')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button onClick={() => mapRef.current?.zoomIn()} className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-lg border-b border-gray-200 dark:border-gray-700">+</button>
          <button onClick={() => mapRef.current?.zoomOut()} className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-lg">-</button>
        </div>
      </div>

      {/* Check-in Modal Overlay */}
      {checkinModal.show && checkinModal.poi && (
        <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-800 text-slate-900 dark:text-white">
            {checkinModal.status === 'idle' && (
              <div className="text-center">
                <div className="text-4xl mb-3">📍</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('gamification.check_in_at', 'Check in at')}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-6 font-bold">{getPoiName(checkinModal.poi)}</p>
                <div className="flex space-x-3">
                  <button onClick={() => setCheckinModal({ show: false, poi: null, status: 'idle', points: 0 })} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition">
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button onClick={handleCheckIn} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md transition">
                    {t('gamification.check_in_now', 'Check In Now')}
                  </button>
                </div>
              </div>
            )}
            
            {checkinModal.status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-gray-500 font-bold">{t('map.verifying_location', 'Verifying location...')}</p>
              </div>
            )}

            {checkinModal.status === 'success' && (
              <div className="text-center py-4 animate-bounce">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">{t('common.success', 'Success!')}</h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1">
                  {t('gamification.points_earned', 'You earned')} <span className="font-extrabold text-amber-500">{checkinModal.points} {t('gamification.points', 'points')}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const LiveMap = MapComponent;
export default LiveMap;
