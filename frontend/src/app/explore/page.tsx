'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function ExplorePage() {
  const { t } = useTranslation();

  const provinces = [
    { id: 'pattani', name: t('landing.pattani', 'Pattani (ปัตตานี)'), thName: 'ปัตตานี', enName: 'PATTANI', link: '/provinces/pattani', color: 'bg-emerald-500', users: '12k', poi: '150+', souvenirs: '50+', image: '/images/slider/pattani.jpg' },
    { id: 'yala', name: t('landing.yala', 'Yala (ยะลา)'), thName: 'ยะลา', enName: 'YALA', link: '/provinces/yala', color: 'bg-teal-500', users: '8k', poi: '120+', souvenirs: '40+', image: '/images/slider/yala.png' },
    { id: 'narathiwat', name: t('landing.narathiwat', 'Narathiwat (นราธิวาส)'), thName: 'นราธิวาส', enName: 'NARATHIWAT', link: '/provinces/narathiwat', color: 'bg-cyan-500', users: '10k', poi: '140+', souvenirs: '60+', image: '/images/slider/narathiwat.png' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <section className="w-full flex flex-col justify-center px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800 dark:text-gray-100">
          {t('landing.explore_regions', 'Explore 3 Southern Border Provinces')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {provinces.map((prov) => (
            <div key={prov.name} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-xl overflow-hidden transform hover:-translate-y-2 transition duration-500 border border-gray-100 dark:border-gray-700 flex flex-col group">
              <div className="p-6 pb-4 cursor-pointer" onClick={() => window.location.href = prov.link}>
                <h3 className="text-3xl font-serif text-emerald-900 dark:text-emerald-400 tracking-wider mb-1">{prov.enName}</h3>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">{prov.thName}</p>
              </div>
              <div className="px-6 pb-4 flex-grow cursor-pointer" onClick={() => window.location.href = prov.link}>
                <div className="h-48 w-full rounded-2xl overflow-hidden relative mb-6 shadow-inner">
                  <div style={{ backgroundImage: `url(${prov.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} className="absolute inset-0 group-hover:scale-110 transition-transform duration-1000 ease-out"></div>
                </div>

              </div>
              <div className="px-6 pb-6 mt-auto">
                <Link href={prov.link} className="flex justify-center items-center py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors w-full shadow-md hover:shadow-lg">
                  ดูรายละเอียดจังหวัด
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
