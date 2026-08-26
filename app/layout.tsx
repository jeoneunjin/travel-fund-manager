import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '트래블펀드 · 여행 자금 관리',
  description: '여행 전 자금 모으기, 여행 중 지출 기록, 여행 후 정산까지 한 곳에서.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-[hsl(210,40%,97%)]">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
