'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto shadow-md">
            SM
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Smart Halal Mobility</h1>
          <p className="text-sm text-gray-500">Sign in to your Halal Tourism account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-600/30 transition duration-200 text-sm"
          >
            Sign In / เข้าสู่ระบบ
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/dashboard" className="text-xs text-emerald-600 hover:underline font-semibold">
            Continue as Guest / เข้าใช้งานในฐานะผู้ใช้ทั่วไป →
          </Link>
        </div>
      </div>
    </div>
  );
}