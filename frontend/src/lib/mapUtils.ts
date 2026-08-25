import L from 'leaflet';

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

export function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ1 = (lng1 * Math.PI) / 180;
  const λ2 = (lng2 * Math.PI) / 180;

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360; // in degrees
}

export function formatETA(minutes: number, locale: 'th' | 'ms' | 'en' | 'ar' = 'en'): string {
  const rounded = Math.round(minutes);
  if (locale === 'th') return `อีก ${rounded} นาที`;
  if (locale === 'ms') return `${rounded} min lagi`;
  if (locale === 'ar') return `${rounded} دقيقة`;
  return `${rounded} min`;
}

export function getVehicleIcon(type: string, heading: number): L.DivIcon {
  let emoji = '🚌';
  let color = 'bg-blue-500';
  
  switch (type) {
    case 'van':
      emoji = '🚐';
      color = 'bg-purple-500';
      break;
    case 'train':
      emoji = '🚆';
      color = 'bg-red-500';
      break;
    case 'songthaew':
      emoji = '🛻';
      color = 'bg-green-500';
      break;
    case 'ev_shuttle':
      emoji = '🚎';
      color = 'bg-teal-500';
      break;
  }

  const html = `
    <div class="relative w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-white ${color}" style="transform: rotate(${heading}deg); transition: transform 0.3s ease-out;">
      <span class="text-xl" style="transform: rotate(-${heading}deg); display: block;">${emoji}</span>
      <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-vehicle-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}
