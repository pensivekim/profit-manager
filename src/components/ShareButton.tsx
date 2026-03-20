'use client';

import { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = 'https://pro.genomic.cc';
    const text = '열심히 일했는데 왜 통장엔 없지? 세금 다 빼고 진짜 남는 돈 확인해보세요.';

    // 모바일 네이티브 공유 (카카오톡 포함)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'KBS비즈니스 경영파트너', text, url });
        return;
      } catch {
        // 사용자 취소
      }
    }

    // PC: 클립보드 복사
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-center" style={{ padding: '28px 16px', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#5F5E5A', marginBottom: '12px' }}>
        주변 사장님께 공유해주세요
      </p>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl font-medium hover:brightness-95 active:scale-[0.98] transition-all"
        style={{ background: '#FEE500', color: '#191919', padding: '12px 28px', fontSize: '15px', border: 'none', cursor: 'pointer' }}>
        {copied ? '\u2705 링크 복사 완료!' : '\uD83D\uDCAC 공유하기'}
      </button>
    </div>
  );
}
