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

  const provinces = [
    { name: t('landing.pattani', 'Pattani (ปัตตานี)'), color: 'bg-emerald-500', users: '12k', poi: '150+' },
    { name: t('landing.yala', 'Yala (ยะลา)'), color: 'bg-teal-500', users: '8k', poi: '120+' },
    { name: t('landing.narathiwat', 'Narathiwat (นราธิวาส)'), color: 'bg-cyan-500', users: '10k', poi: '140+' }
  ];

  const features = [
    { icon: '🗺️', title: t('map.live_map', 'Real-time Transit') },
    { icon: '🕌', title: t('prayer.prayer_times', 'Prayer Times') },
    { icon: '🎮', title: t('gamification.stamp_book', 'Gamification') },
    { icon: '💳', title: t('payment.payment', 'Multi-currency') }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] bg-gradient-to-br from-emerald-800 to-teal-600 flex flex-col justify-center items-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-[800px] h-[800px] fill-current">
            <text x="50" y="50" fontSize="20" textAnchor="middle" fontFamily="serif">حلال</text>
          </svg>
        </div>
        
        <div className="z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 h-16 animate-pulse transition-all duration-500">
            {titles[titleIdx]}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-emerald-100 font-medium">
            {t('landing.hero_subtitle', 'Your trusted companion for tourism and transport in Southern Thailand.')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/map" className="px-6 py-3 bg-white text-emerald-800 font-extrabold rounded-full shadow-lg hover:bg-gray-100 transition">
              🗺️ {t('map.live_map', 'Open Live Map')}
            </Link>
            <Link href="/dashboard" className="px-6 py-3 bg-emerald-700 text-white font-extrabold rounded-full shadow-lg hover:bg-emerald-600 transition border border-emerald-500">
              🚀 {t('landing.start_journey', 'Start Journey')}
            </Link>
          </div>
        </div>
      </section>

      {/* Provinces */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800 dark:text-gray-100">
          {t('landing.explore_regions', 'Explore 3 Southern Border Provinces')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {provinces.map((prov) => (
            <div key={prov.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-1 transition duration-300 border border-gray-100 dark:border-gray-700">
              <div className={`h-40 w-full ${prov.color} flex items-center justify-center`}>
                <span className="text-white text-2xl font-bold opacity-90">🕌 {prov.name}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{prov.name}</h3>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{prov.users} {t('landing.users', 'Active Users')}</span>
                  <span>{prov.poi} {t('map.halal_food', 'Halal POIs')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900 w-full">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800 dark:text-gray-100">
            {t('landing.key_features', 'Key Platform Features')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div key={feat.title} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
                <div className="text-4xl mb-4">{feat.icon}</div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{feat.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-emerald-900 text-white w-full">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold mb-2 text-emerald-300">30k+</div>
            <div className="text-xs uppercase tracking-wider font-bold">{t('landing.users', 'Active Users')}</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold mb-2 text-emerald-300">500+</div>
            <div className="text-xs uppercase tracking-wider font-bold">{t('map.vehicles', 'Vehicles')}</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold mb-2 text-emerald-300">1.2k</div>
            <div className="text-xs uppercase tracking-wider font-bold">{t('map.halal_food', 'Halal Places')}</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold mb-2 text-yellow-400">5M+</div>
            <div className="text-xs uppercase tracking-wider font-bold">{t('gamification.points_earned', 'Points Distributed')}</div>
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="py-12 text-center w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="inline-flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 rounded-full border border-emerald-200 dark:border-emerald-800">
          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
            HALAL
          </div>
          <div className="text-left">
            <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('landing.certified_title', 'Verified Halal Platform')}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('landing.certified_desc', 'Certified by local Islamic authorities in Pattani, Yala, and Narathiwat.')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}