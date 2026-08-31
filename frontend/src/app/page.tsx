'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function LandingPage() {
  const { t } = useTranslation();

  const titles = [
    t('common.app_name', 'Smart Halal Mobility'),
    'สมาร์ทฮาลาลโมบิลิตี้',
    'Mobiliti Halal Pintar',
    'التنقل الحلال الذكي'
  ];
  const [titleIdx, setTitleIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIdx((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles]);


  const heroWords = ['hero_word_1', 'hero_word_2', 'hero_word_3', 'hero_word_4'];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % heroWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [bgIdx, setBgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIdx((prev) => (prev + 1) % provinces.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);


  const provinces = [
    { id: 'pattani', name: t('landing.pattani', 'Pattani (ปัตตานี)'), thName: 'ปัตตานี', enName: 'PATTANI', link: '/provinces/pattani', color: 'bg-emerald-500', users: '12k', poi: '150+', souvenirs: '50+', image: '/images/slider/pattani.jpg' },
    { id: 'yala', name: t('landing.yala', 'Yala (ยะลา)'), thName: 'ยะลา', enName: 'YALA', link: '/provinces/yala', color: 'bg-teal-500', users: '8k', poi: '120+', souvenirs: '40+', image: '/images/slider/yala.png' },
    { id: 'narathiwat', name: t('landing.narathiwat', 'Narathiwat (นราธิวาส)'), thName: 'นราธิวาส', enName: 'NARATHIWAT', link: '/provinces/narathiwat', color: 'bg-cyan-500', users: '10k', poi: '140+', souvenirs: '60+', image: '/images/slider/narathiwat.png' }
  ];

  const features = [
    { icon: '🗺️', title: t('map.live_map', 'Real-time Transit'), link: '/map' },
    { icon: '🕌', title: t('prayer.prayer_times', 'Prayer Times'), link: '/prayer' },
    { icon: '🎮', title: t('gamification.stamp_book', 'Gamification'), link: '/rewards' },
    { icon: '💳', title: t('payment.payment', 'Multi-currency'), link: '/dashboard' }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col justify-center items-center text-white overflow-hidden">
        {/* Background Image Slider */}
        {provinces.map((prov, i) => (
          <div 
            key={prov.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === bgIdx ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              backgroundImage: `url(${prov.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
          />
        ))}
        {/* Dark Green Overlay */}
        
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        
        {/* Background Decorative Elements Removed */}
        
        {/* Slider Controls */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-3">
          {provinces.map((prov, i) => (
            <button 
              key={prov.id}
              onClick={() => setBgIdx(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === bgIdx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
        <button onClick={() => setBgIdx((prev) => (prev - 1 + provinces.length) % provinces.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition">
          ◀
        </button>
        <button onClick={() => setBgIdx((prev) => (prev + 1) % provinces.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition">
          ▶
        </button>
        
        <div className="z-10 text-center px-4 pt-10">
          <h1 className="text-5xl md:text-8xl font-serif mb-8 h-auto transition-all duration-500 text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] text-white tracking-widest uppercase">
            {t(`landing.${heroWords[wordIdx]}`)}
          </h1>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/map" className="px-6 py-3 bg-white text-emerald-800 font-extrabold rounded-full shadow-lg hover:bg-gray-100 transition">
              🗺️ {t('map.live_map', 'Open Live Map')}
            </Link>
            <Link href="/explore" className="px-6 py-3 bg-emerald-700 text-white font-extrabold rounded-full shadow-lg hover:bg-emerald-600 transition border border-emerald-500">
              🚀 {t('landing.start_journey', 'Start Journey')}
            </Link>
          </div>
        </div>
      </section>

        </div>
  );
}
