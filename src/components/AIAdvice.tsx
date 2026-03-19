'use client';

import { useState } from 'react';

interface Advice {
  type: 'danger' | 'warning' | 'good' | 'info';
  title: string;
  body: string;
  proLink: 'tax' | 'labor' | 'legal' | 'none';
}

interface Props {
  calcResult: Record<string, number>;
  bizType: string;
  taxType: string;
  revenue: number;
  empCount: number;
  autoFetch: boolean;
  onProLink?: (tab: string) => void;
}

const TYPE_STYLES = {
  danger:  { border: 'border-l-red-500 bg-red-50',     icon: '\uD83D\uDEA8', label: '위험', labelBg: 'bg-red-500' },
  warning: { border: 'border-l-amber-500 bg-amber-50',   icon: '\u26A0\uFE0F', label: '주의', labelBg: 'bg-amber-500' },
  good:    { border: 'border-l-emerald-500 bg-emerald-50', icon: '\u2705', label: '양호', labelBg: 'bg-emerald-500' },
  info:    { border: 'border-l-blue-500 bg-blue-50',     icon: '\uD83D\uDCA1', label: '참고', labelBg: 'bg-blue-500' },
};

const PRO_LABELS: Record<string, string> = {
  tax: '세무사 연결',
  labor: '노무사 연결',
  legal: '변호사 연결',
};

export default function AIAdvice({ calcResult, bizType, taxType, revenue, empCount, autoFetch, onProLink }: Props) {
  const [advices, setAdvices] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calcResult, bizType, taxType, revenue, empCount }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setAdvices(data.advices || []);
      setFetched(true);
    } catch {
      setError('AI 조언을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  // autoFetch 처리: 컴포넌트 마운트 시 한 번만
  if (autoFetch && !fetched && !loading && !error) {
    fetchAdvice();
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-8 shadow-sm border border-[#e0d5c5] text-center" style={{ background: '#FFFDF7' }}>
        <div className="flex justify-center gap-2 mb-4">
          <span className="w-3.5 h-3.5 bg-[#2D5A8E] rounded-full animate-pulse" />
          <span className="w-3.5 h-3.5 bg-[#2D5A8E] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-3.5 h-3.5 bg-[#2D5A8E] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <p className="text-[#5a4a3a]" style={{ fontSize: '16px', lineHeight: '1.8' }}>
          사장님 데이터 분석 중...
        </p>
        <p className="text-[#a09080]" style={{ fontSize: '14px', lineHeight: '1.8' }}>
          잠시만 기다려주세요
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 shadow-sm border border-[#e0d5c5]" style={{ background: '#FFFDF7' }}>
        <p className="text-red-500 text-center mb-4" style={{ fontSize: '16px', lineHeight: '1.8' }}>{error}</p>
        <button
          onClick={fetchAdvice}
          className="w-full py-3.5 rounded-xl bg-[#2D5A8E] text-white font-bold hover:bg-[#24496f] transition-colors"
          style={{ fontSize: '16px', minHeight: '48px' }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!fetched) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-[#3a3025] px-1" style={{ fontSize: '16px', lineHeight: '1.8' }}>
        {"\uD83E\uDD16"} AI 경영 조언
      </h3>

      {advices.map((a, i) => {
        const style = TYPE_STYLES[a.type] || TYPE_STYLES.info;
        return (
          <div
            key={i}
            className={`rounded-xl border-l-4 ${style.border}`}
            style={{ padding: '16px 20px', lineHeight: '1.8' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{style.icon}</span>
              <span className={`text-xs text-white px-2.5 py-0.5 rounded-full font-bold ${style.labelBg}`}>
                {style.label}
              </span>
              <span className="font-bold text-[#3a3025]" style={{ fontSize: '16px' }}>
                {a.title}
              </span>
            </div>
            <p className="text-[#5a4a3a]" style={{ fontSize: '16px', lineHeight: '1.8' }}>
              {a.body}
            </p>
            {a.proLink && a.proLink !== 'none' && onProLink && (
              <button
                onClick={() => onProLink(a.proLink)}
                className="mt-3 py-2.5 px-4 rounded-lg bg-[#2D5A8E] text-white font-bold text-sm hover:bg-[#24496f] transition-colors"
                style={{ minHeight: '44px' }}
              >
                {PRO_LABELS[a.proLink]} {"\u2192"}
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={fetchAdvice}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[#c0b5a5] text-[#a09080] font-semibold hover:border-[#2D5A8E] hover:text-[#2D5A8E] transition-colors"
        style={{ fontSize: '16px', minHeight: '48px', lineHeight: '1.8' }}
      >
        조언 다시 받기
      </button>
    </div>
  );
}
