'use client';

import { useState, useEffect } from 'react';
import { isPWAInstalled } from '@/lib/push';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isPWAInstalled()) return;
    const d = localStorage.getItem('install_banner_dismissed');
    if (d && (Date.now() - new Date(d).getTime()) / 86400000 < 7) return;

    // show banner after short delay to avoid sync setState
    const timer = setTimeout(() => setDismissed(false), 500);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', handler); };
  }, []);

  if (dismissed) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleInstall = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setDismissed(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('install_banner_dismissed', new Date().toISOString());
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="max-w-lg mx-auto rounded-2xl p-4 shadow-lg border border-border" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{"\uD83D\uDCF1"}</span>
          <div className="flex-1">
            <p className="font-bold" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
              홈화면에 추가하세요
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>
              앱처럼 바로 열고, 매주 알림도 받을 수 있어요
            </p>
            {isIOS ? (
              <p className="font-semibold mt-2" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)' }}>
                Safari {"\u2192"} 공유 버튼 {"\u2192"} 홈 화면에 추가
              </p>
            ) : (
              <button onClick={handleInstall} className="mt-2 py-2.5 px-5 rounded-lg text-white font-bold"
                style={{ fontSize: 'var(--font-size-base)', minHeight: '44px', background: 'var(--accent)' }}>
                홈화면에 추가
              </button>
            )}
          </div>
          <button onClick={handleDismiss} className="text-lg p-1" style={{ minWidth: '32px', minHeight: '32px', color: 'var(--text-hint)' }}>
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
