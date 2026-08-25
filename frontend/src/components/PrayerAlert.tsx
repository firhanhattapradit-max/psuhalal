'use client';

import React, { useEffect, useState } from 'react';

interface PrayerAlertProps {
  prayerName: {
    en: string;
    ar: string;
    local: string;
  };
  prayerTime: string;
  nearestMosqueName?: string;
  nearestMosqueDistance?: number;
  onDismiss: () => void;
  onNavigate?: () => void;
}

export default function PrayerAlert({
  prayerName,
  prayerTime,
  nearestMosqueName,
  nearestMosqueDistance,
  onDismiss,
  onNavigate
}: PrayerAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss after 30 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div 
        role="alert"
        aria-live="assertive"
        className={`pointer-events-auto w-full max-w-md bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out transform ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
        }`}
      >
        {/* Banner decorative top border */}
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500"></div>
        
        <div className="p-4 flex flex-col space-y-3">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-800 p-2 rounded-lg text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  <span className="font-arabic text-xl">{prayerName.ar}</span>
                  <span className="text-emerald-200">|</span>
                  <span>{prayerName.en} Approaching</span>
                </h3>
                <p className="text-emerald-100 text-sm">Time: {prayerTime}</p>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-emerald-300 hover:text-white transition-colors"
              aria-label="Dismiss alert"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Mosque Info (if available) */}
          {nearestMosqueName && (
            <div className="bg-emerald-800/50 rounded-lg p-3 border border-emerald-600/50 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{nearestMosqueName}</p>
                <p className="text-emerald-200 text-xs">
                  {nearestMosqueDistance ? `${nearestMosqueDistance.toFixed(1)} km away` : 'Nearby'}
                </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            {onNavigate && nearestMosqueName && (
              <button 
                onClick={onNavigate}
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 font-bold py-2 px-4 rounded-lg shadow text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Navigate to Mosque
              </button>
            )}
            <button 
              onClick={handleDismiss}
              className={`flex-1 bg-emerald-800 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg border border-emerald-600 text-sm transition-colors ${!onNavigate ? 'max-w-[120px] ml-auto' : ''}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
