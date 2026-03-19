'use client';

import { useState, useEffect } from 'react';
import { isPWAInstalled } from '@/lib/push';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallBanner() {
  const [state, setState] = useState<{ show: boolean; isIOS: boolean; prompt: BeforeInstallPromptEvent | null }>({
    show: false, isIOS: false, prompt: null,
  });

  useEffect(() => {
    if (isPWAInstalled()) return;

    const dismissed = localStorage.getItem('install_banner_dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isiOS) {
      setState({ show: true, isIOS: true, prompt: null });
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setState({ show: true, isIOS: false, prompt: e as BeforeInstallPromptEvent });
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    if (state.prompt) {
      await state.prompt.prompt();
      const { outcome } = await state.prompt.userChoice;
      if (outcome === 'accepted') setState(s => ({ ...s, show: false }));
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('install_banner_dismissed', new Date().toISOString());
    setState(s => ({ ...s, show: false }));
  };

  if (!state.show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="max-w-lg mx-auto rounded-2xl p-4 shadow-lg border border-[#e0d5c5]" style={{ background: '#FFFDF7' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{"\uD83D\uDCF1"}</span>
          <div className="flex-1">
            <p className="font-bold text-[#3a3025]" style={{ fontSize: '16px', lineHeight: '1.8' }}>
              홈화면에 추가하세요
            </p>
            <p className="text-[#5a4a3a]" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              앱처럼 바로 열고, 매주 알림도 받을 수 있어요
            </p>

            {state.isIOS ? (
              <p className="text-[#2D5A8E] font-semibold mt-2" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                Safari {"\u2192"} 공유 버튼 {"\u2192"} 홈 화면에 추가
              </p>
            ) : (
              <button
                onClick={handleInstall}
                className="mt-2 py-2.5 px-5 rounded-lg bg-[#2D5A8E] text-white font-bold"
                style={{ fontSize: '16px', minHeight: '44px' }}
              >
                홈화면에 추가
              </button>
            )}
          </div>
          <button onClick={handleDismiss} className="text-[#a09080] text-lg p-1" style={{ minWidth: '32px', minHeight: '32px' }}>
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
