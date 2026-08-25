'use client';

import React from 'react';
import StampBook from '@/components/StampBook';
import { useTranslation } from '@/lib/i18n';

export default function RewardsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 w-full space-y-6">
      <header className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <span className="text-3xl">🎁</span>
          <h1 className="text-3xl font-extrabold mt-2">{t('gamification.rewards', 'Rewards & Gamification')}</h1>
          <p className="text-amber-100 text-sm mt-1">{t('gamification.stamp_book', 'Redeem rewards, earn digital stamps, participate in Sadaqah, and climb the leaderboard.')}</p>
        </div>
      </header>

      <section className="bg-white dark:bg-gray-900 rounded-3xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-gray-800">
        <StampBook userId="demo-user-123" authToken="demo-token" />
      </section>
    </div>
  );
}