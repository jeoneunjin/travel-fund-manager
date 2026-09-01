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
            {/* 히어로 배너가 풀블리드(100vw)로 탈출하면서 생기는 스크롤바 폭만큼의
                가로 오버플로우를 여기서 막음 — SiteHeader는 형제라 sticky에 영향 없음 */}
            <main className="overflow-x-hidden">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
