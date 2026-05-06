/**
 * Home - スケジュール管理アプリ メインページ
 * Design: ネオモーフィズム × iOS風ミニマリズム
 * - 単一ウィンドウ構成
 * - 初期表示はカレンダー
 * - アプリ全体をiPhoneのホーム画面風に演出
 */

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import { ScheduleProvider } from '@/contexts/ScheduleContext';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScheduleProvider>
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(145deg, oklch(0.93 0.008 240) 0%, oklch(0.91 0.01 250) 50%, oklch(0.93 0.006 230) 100%)',
        }}
      >
        {/* App Window */}
        <div
          className="w-full max-w-sm bg-background rounded-3xl overflow-visible flex flex-col relative"
          style={{
            height: 'min(780px, calc(100vh - 2rem))',
            boxShadow: '12px 12px 30px oklch(0.72 0.01 240 / 0.5), -8px -8px 20px oklch(0.98 0.003 240 / 0.9)',
          }}
        >
          {/* Status Bar (iOS style) */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2 flex-shrink-0">
            <span className="text-xs font-semibold text-foreground/70">
              {currentTime}
            </span>
            <div className="flex items-center gap-1.5">
              {/* Signal bars */}
              <div className="flex items-end gap-0.5">
                {[3, 5, 7, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-sm bg-foreground/60"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              {/* WiFi */}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="text-foreground/60">
                <path d="M7 8.5C7.55 8.5 8 8.95 8 9.5C8 10.05 7.55 10.5 7 10.5C6.45 10.5 6 10.05 6 9.5C6 8.95 6.45 8.5 7 8.5Z" fill="currentColor"/>
                <path d="M7 5.5C8.38 5.5 9.63 6.06 10.54 6.97L11.6 5.91C10.4 4.71 8.78 3.97 7 3.97C5.22 3.97 3.6 4.71 2.4 5.91L3.46 6.97C4.37 6.06 5.62 5.5 7 5.5Z" fill="currentColor"/>
                <path d="M7 2.5C9.21 2.5 11.21 3.43 12.63 4.93L13.69 3.87C11.98 2.09 9.62 1 7 1C4.38 1 2.02 2.09 0.31 3.87L1.37 4.93C2.79 3.43 4.79 2.5 7 2.5Z" fill="currentColor"/>
              </svg>
              {/* Battery */}
              <div className="flex items-center gap-0.5">
                <div className="w-5 h-3 rounded-sm border border-foreground/60 relative overflow-hidden">
                  <div className="absolute inset-0.5 right-1 bg-foreground/60 rounded-sm" />
                </div>
                <div className="w-0.5 h-1.5 bg-foreground/60 rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* App Header */}
          <div className="px-5 pb-3 flex-shrink-0">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">カレンダー</h1>
          </div>

          {/* Calendar Content */}
          <div className="flex-1 overflow-hidden px-4 pb-0 relative">
            <Calendar />
          </div>

          {/* Home Indicator (iOS style) */}
          <div className="flex justify-center pb-2 pt-1 flex-shrink-0">
            <div className="w-28 h-1 rounded-full bg-foreground/20" />
          </div>
        </div>
      </div>
    </ScheduleProvider>
  );
}
