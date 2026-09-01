'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Rocket, ArrowRight, Compass } from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();

  const heroWords = ['hero_word_1', 'hero_word_2', 'hero_word_3', 'hero_word_4'];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroWords.length]);

  const provinces = [
    { id: 'pattani', name: t('landing.pattani', 'Pattani (ปัตตานี)'), image: '/images/slider/pattani.jpg' },
    { id: 'yala', name: t('landing.yala', 'Yala (ยะลา)'), image: '/images/slider/yala.png' },
    { id: 'narathiwat', name: t('landing.narathiwat', 'Narathiwat (นราธิวาส)'), image: '/images/slider/narathiwat.png' }
  ];
  const [bgIdx, setBgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIdx((prev) => (prev + 1) % provinces.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [provinces.length]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col justify-center items-center text-white overflow-hidden">
        
        {/* Background Image Slider with subtle zoom */}
        <AnimatePresence initial={false}>
          <motion.div
            key={bgIdx}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
            style={{ 
              backgroundImage: `url(${provinces[bgIdx].image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
          />
        </AnimatePresence>

        {/* Gradient Overlay for Pro look */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/80 z-0 backdrop-blur-[2px]"></div>
        
        {/* Slider Controls */}
        <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center items-center gap-4">
          {provinces.map((prov, i) => (
            <button 
              key={prov.id}
              onClick={() => setBgIdx(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                i === bgIdx ? 'w-10 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
        
        <div className="z-10 text-center px-4 pt-10 flex flex-col items-center justify-center w-full max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm md:text-base font-medium tracking-wide text-emerald-300 uppercase"
          >
            ✨ The Future of Halal Tourism
          </motion.div>
          
          <div className="h-32 md:h-40 flex items-center justify-center overflow-hidden mb-16 w-full">
            <AnimatePresence mode="wait">
              <motion.h1 
                key={wordIdx}
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-5xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 drop-shadow-[0_4px_24px_rgba(5,150,105,0.4)] uppercase tracking-tight"
                style={{ lineHeight: '1.2' }}
              >
                {t(`landing.${heroWords[wordIdx]}`)}
              </motion.h1>
            </AnimatePresence>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full sm:w-auto mt-4"
          >
            <Link href="/map" className="group relative px-8 py-4 w-full sm:w-auto flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_forwards]"></div>
              <Map className="w-5 h-5" />
              <span>{t('map.live_map', 'เปิดแผนที่ Live')}</span>
            </Link>
            
            <Link href="/explore" className="group px-8 py-4 w-full sm:w-auto flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
              <span>{t('landing.start_journey', 'เริ่มสำรวจ')}</span>
            </Link>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70"
        >
          <span className="text-xs uppercase tracking-widest mb-2 font-medium">Scroll</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-white/50 rounded-full flex justify-center pt-1"
          >
            <div className="w-1 h-2 bg-emerald-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
