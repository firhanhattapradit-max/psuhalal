import type { Metadata } from 'next';
import { Noto_Sans_Thai, Noto_Kufi_Arabic } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';

const notoSansThai = Noto_Sans_Thai({ subsets: ['thai', 'latin'], variable: '--font-noto-thai' });
const notoArabic = Noto_Kufi_Arabic({ subsets: ['arabic'], variable: '--font-noto-arabic' });

export const metadata: Metadata = {
  title: 'Smart Halal Mobility & Tourism Platform',
  description: 'A comprehensive platform for halal tourism and mobility in Southern Thailand.',
  themeColor: '#059669',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  openGraph: {
    title: 'Smart Halal Mobility',
    description: 'Explore Southern Thailand with confidence.',
    url: 'https://smarthalal.example.com',
    siteName: 'Smart Halal',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

import I18nProvider from '@/components/I18nProvider';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => <div className="theme-provider">{children}</div>;
const Toaster = () => <div id="toaster-root"></div>;

export default function RootLayout({
  children,
  params: { lang = 'en' },
}: {
  children: React.ReactNode;
  params: { lang?: string };
}) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} className={`${notoSansThai.variable} ${notoArabic.variable}`}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
        <I18nProvider>
          <ThemeProvider>
            <NavBar />
            <main className="flex-1">
              {children}
            </main>
            {/* Fallback footer if missing component */}
            <footer className="bg-white dark:bg-gray-800 p-4 text-center border-t border-gray-200 dark:border-gray-700">
              <p>&copy; {new Date().getFullYear()} Smart Halal Mobility & Tourism Platform</p>
            </footer>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
