'use client';

import { useState } from 'react';

interface TrendItem {
  type: 'subsidy' | 'marketing' | 'blog';
  icon: string;
  title: string;
  body: string;
  link?: string;
}

interface Props {
  bizType: string;
  region: string;
  revenue: number;
  autoFetch: boolean;
}

const TYPE_STYLES: Record<string, { bg: string; border: string; label: string; labelBg: string }> = {
  subsidy:   { bg: '#FEF3E2', border: '#F5C66E', label: '지원금/혜택', labelBg: '#E8920D' },
  marketing: { bg: '#E8F5E9', border: '#81C784', label: '마케팅', labelBg: '#2E7D4F' },
  blog:      { bg: '#E3F2FD', border: '#64B5F6', label: '블로그 글감', labelBg: '#1565C0' },
};

export default function LocalTrends({ bizType, region, revenue, autoFetch }: Props) {
  const [items, setItems] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizType, region, revenue }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setItems(data.items || []);
      setFetched(true);
    } catch {
      setError('최신 정보를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (autoFetch && !fetched && !loading && !error) {
    fetchTrends();
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-8 shadow-sm border border-border text-center" style={{ background: 'var(--bg-card)' }}>
        <div className="flex justify-center gap-2 mb-4">
          <span className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ background: '#E8920D' }} />
          <span className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ background: '#2E7D4F', animationDelay: '0.2s' }} />
          <span className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ background: '#1565C0', animationDelay: '0.4s' }} />
        </div>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
          지역 최신 정보 검색 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 shadow-sm border border-border" style={{ background: 'var(--bg-card)' }}>
        <p className="text-red-500 text-center mb-4" style={{ fontSize: 'var(--font-size-base)' }}>{error}</p>
        <button onClick={fetchTrends} className="w-full py-3 rounded-xl text-white font-bold" style={{ background: 'var(--accent)', minHeight: '48px' }}>
          다시 시도
        </button>
      </div>
    );
  }

  if (!fetched) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold px-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
        {"\uD83D\uDCE2"} 최신 혜택 · 마케팅 · 블로그 글감
      </h3>

      {items.map((item, i) => {
        const style = TYPE_STYLES[item.type] || TYPE_STYLES.marketing;
        return (
          <div key={i} className="rounded-xl border-l-4 p-4" style={{ background: style.bg, borderLeftColor: style.border }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs text-white px-2.5 py-0.5 rounded-full font-bold" style={{ background: style.labelBg }}>
                {style.label}
              </span>
              <span className="font-bold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                {item.title}
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>
              {item.body}
            </p>
            {item.link && item.link.startsWith('http') && (
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 font-semibold underline" style={{ fontSize: 'var(--font-size-sm)', color: style.labelBg }}>
                자세히 보기 {"\u2192"}
              </a>
            )}
          </div>
        );
      })}

      <button onClick={fetchTrends}
        className="w-full py-3 rounded-xl border-2 border-dashed border-border font-semibold"
        style={{ fontSize: 'var(--font-size-base)', minHeight: '48px', color: 'var(--text-hint)' }}>
        새로운 정보 받기
      </button>
    </div>
  );
}
