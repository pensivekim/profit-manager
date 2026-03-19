'use client';

import { useState, useEffect } from 'react';

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
  danger:  { bg: 'bg-red-50', border: 'border-red-300', icon: '\uD83D\uDEA8', label: '위험', labelBg: 'bg-red-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-300', icon: '\u26A0\uFE0F', label: '주의', labelBg: 'bg-amber-500' },
  good:    { bg: 'bg-emerald-50', border: 'border-emerald-300', icon: '\u2705', label: '양호', labelBg: 'bg-emerald-500' },
  info:    { bg: 'bg-blue-50', border: 'border-blue-300', icon: '\uD83D\uDCA1', label: '참고', labelBg: 'bg-blue-500' },
};

const PRO_LABELS: Record<string, string> = {
  tax: '세무사 상담',
  labor: '노무사 상담',
  legal: '변호사 상담',
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

  useEffect(() => {
    if (autoFetch && !fetched && !loading) {
      fetchAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center gap-1 mb-3">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]" />
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
        <p className="text-sm text-gray-500">AI가 경영 데이터를 분석하고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-red-500 text-center mb-3">{error}</p>
        <button
          onClick={fetchAdvice}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!fetched) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-3xl mb-3">{"\uD83E\uDD16"}</p>
        <p className="text-sm text-gray-600 mb-4">
          AI가 경영 데이터를 분석하여<br />맞춤 조언을 제공합니다
        </p>
        <button
          onClick={fetchAdvice}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          AI 경영 조언 받기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {advices.map((a, i) => {
        const style = TYPE_STYLES[a.type] || TYPE_STYLES.info;
        return (
          <div key={i} className={`rounded-xl p-4 border-2 ${style.bg} ${style.border}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{style.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs text-white px-2 py-0.5 rounded-full ${style.labelBg}`}>
                    {style.label}
                  </span>
                  <span className="font-bold text-gray-800 text-sm">{a.title}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{a.body}</p>
                {a.proLink && a.proLink !== 'none' && onProLink && (
                  <button
                    onClick={() => onProLink('pro')}
                    className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    {PRO_LABELS[a.proLink]} {"\u2192"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={fetchAdvice}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        조언 다시 받기
      </button>

      <button
        onClick={() => onProLink?.('pro')}
        className="w-full py-3 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
      >
        전문가에게 이 데이터 공유하기
      </button>
    </div>
  );
}
