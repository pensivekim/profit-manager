'use client';

import { useState, useEffect, useRef } from 'react';
import { isPWAInstalled } from '@/lib/push';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isPWAInstalled()) return;
    const d = localStorage.getItem('install_banner_dismissed');
    if (d && (Date.now() - new Date(d).getTime()) / 86400000 < 7) return;

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', handler);

    const timer = setTimeout(() => setShow(true), 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!show) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleInstall = async () => {
    if (promptRef.current) {
      await promptRef.current.prompt();
      const { outcome } = await promptRef.current.userChoice;
      if (outcome === 'accepted') setShow(false);
    } else {
      // prompt 없으면 안내 알림
      alert('브라우저 메뉴(⋮)에서 "홈 화면에 추가"를 눌러주세요.');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('install_banner_dismissed', new Date().toISOString());
    setShow(false);
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
