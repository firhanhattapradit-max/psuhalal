'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import i18n, { useTranslation } from '@/lib/i18n';

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('th');
  const pathname = usePathname();
  const { t } = useTranslation();

  // Mock auth state for UI
  const isLoggedIn = true;
  const points = 1250;

  useEffect(() => {
    if (i18n.language) {
      setCurrentLang(i18n.language.substring(0, 2).toLowerCase());
    }
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = code;
    }
  };

  const navLinks = [
    { name: t('map.live_map', 'Map'), path: '/map', icon: '🗺️' },
    { name: t('prayer.prayer_times', 'Prayer'), path: '/prayer', icon: '🕌' },
    { name: t('gamification.stamp_book', 'Dashboard'), path: '/dashboard', icon: '📊' },
    { name: t('gamification.rewards', 'Rewards'), path: '/rewards', icon: '🎁' },
  ];

  const langs = [
    { code: 'th', flag: '🇹🇭', label: 'TH', name: 'ไทย' },
    { code: 'ms', flag: '🇲🇾', label: 'MS', name: 'Melayu' },
    { code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
    { code: 'ar', flag: '🇸🇦', label: 'AR', name: 'العربية' }
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold transform rotate-6 group-hover:rotate-0 transition shadow-md">
                <span className="text-xs font-extrabold">SM</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none text-gray-900 dark:text-white">Smart Halal</span>
                <span className="text-[10px] text-emerald-600 font-medium">Mobility & Tourism</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive 
                      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 shadow-sm border border-emerald-200/60 dark:border-emerald-800/60' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/80 dark:border-gray-700">
              {langs.map(l => (
                <button 
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    currentLang === l.code
                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={`${l.name} (${l.label})`}
                >
                  <span>{l.flag}</span>
                  <span className="font-extrabold">{l.label}</span>
                </button>
              ))}
            </div>

            {/* Auth / Points Badge */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-300/60 transition shadow-sm">
                  <span>🪙</span>
                  <span>{points.toLocaleString()}</span>
                </Link>
                <Link href="/dashboard" className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition">
                  U
                </Link>
              </div>
            ) : (
              <Link href="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 absolute w-full left-0 z-40 shadow-xl p-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Language / ภาษา</p>
            <div className="grid grid-cols-4 gap-2">
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    changeLanguage(l.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border ${
                    currentLang === l.code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="font-extrabold">{l.label}</span>
                  <span className="text-[10px] opacity-80">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
