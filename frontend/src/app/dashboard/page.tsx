'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import StampBook from '@/components/StampBook';
import { useTranslation } from '@/lib/i18n';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));

  const mockUserId = user?.id || 'demo-user-123';
  const mockAuthToken = 'demo-token';

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 w-full space-y-8">
      {/* User Welcome Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-3">
            <span>✨</span>
            <span>{t('gamification.rank_explorer', 'Halal Traveler Status: Explorer')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">{t('common.welcome', 'Welcome back')}, {user?.name || 'Halal Traveler'}! 👋</h1>
          <p className="text-emerald-100 mt-1 text-sm md:text-base">{t('common.app_name', 'Explore Southern Thailand (Pattani · Yala · Narathiwat) with Halal mobility & rewards.')}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link href="/map" className="flex-1 md:flex-none bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition text-center flex items-center justify-center gap-2">
            <span>🗺️</span>
            <span>{t('map.live_map', 'Live Transit Map')}</span>
          </Link>
          <Link href="/prayer" className="flex-1 md:flex-none bg-emerald-800/60 hover:bg-emerald-800/80 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition text-center flex items-center justify-center gap-2">
            <span>🕌</span>
            <span>{t('prayer.prayer_times', 'Qibla & Prayer')}</span>
          </Link>
        </div>
      </header>

      {/* Gamification & StampBook Component */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-gray-800">
        <StampBook userId={mockUserId} authToken={mockAuthToken} />
      </section>
    </div>
  );
}