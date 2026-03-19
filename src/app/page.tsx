'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { getTodayQuote, getTodayTip, getGreeting, getTodayDate } from '@/lib/daily';

export default function LandingPage() {
  const greeting = useMemo(() => getGreeting(), []);
  const dateStr = useMemo(() => getTodayDate(), []);
  const quote = useMemo(() => getTodayQuote(), []);
  const tip = useMemo(() => getTodayTip(), []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-hint)' }}>{dateStr}</p>
            <h1 className="font-bold mt-0.5" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>{greeting}</h1>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl" style={{ background: 'var(--accent-light)' }}>
            {"\uD83D\uDCB0"}
          </div>
        </div>

        <div className="rounded-2xl p-5 shadow-sm mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-2" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)' }}>{"\u2728"} 오늘의 한마디</p>
          <p className="font-medium" style={{ color: 'var(--text-primary)', lineHeight: 'var(--line-height)' }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="mt-2 text-right" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-hint)' }}>- {quote.author}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/calc" className="rounded-2xl p-4 shadow-sm text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--accent)' }}>
            <span className="text-2xl block mb-1">{"\uD83E\uDDEE"}</span>
            <span className="font-bold" style={{ fontSize: 'var(--font-size-sm)' }}>실수령액 계산</span>
            <span className="block opacity-70 mt-0.5" style={{ fontSize: 'var(--font-size-xs)' }}>진짜 남는 돈 확인</span>
          </Link>
          <Link href="/history" className="rounded-2xl p-4 shadow-sm text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--success)' }}>
            <span className="text-2xl block mb-1">{"\uD83D\uDCCA"}</span>
            <span className="font-bold" style={{ fontSize: 'var(--font-size-sm)' }}>주별 추이</span>
            <span className="block opacity-70 mt-0.5" style={{ fontSize: 'var(--font-size-xs)' }}>나아지고 있을까?</span>
          </Link>
        </div>

        <div className="rounded-2xl p-4 shadow-sm mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-1" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent)' }}>{"\uD83D\uDCA1"} 오늘의 경영 팁</p>
          <p className="font-bold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{tip.title}</p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)' }}>{tip.body}</p>
        </div>

        <div className="rounded-2xl p-5 shadow-sm mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>이런 분들을 위해 만들었어요</h2>
          <p className="mb-3" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-hint)' }}>매달 얼마 남는지 막막한 모든 분</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '\uD83C\uDF5C', label: '식당/카페\n사장님' },
              { icon: '\u2702\uFE0F', label: '미용실\n사장님' },
              { icon: '\uD83D\uDEB4', label: '배달/퀵\n라이더' },
              { icon: '\uD83D\uDC84', label: '방문판매\n설화수/애터미' },
              { icon: '\uD83D\uDCBB', label: '프리랜서\n1인사업' },
              { icon: '\uD83D\uDE95', label: '대리운전\n플랫폼노동' },
            ].map((p) => (
              <div key={p.label} className="rounded-xl p-2.5 text-center" style={{ background: 'var(--bg-page)' }}>
                <span className="text-xl block">{p.icon}</span>
                <span className="mt-1 block whitespace-pre-line leading-tight" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 shadow-sm mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold mb-3" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>무료로 이런 걸 해드려요</h2>
          <div className="space-y-2.5">
            {[
              { icon: '\uD83E\uDDEE', title: '실수령액 계산', desc: '세금, 보험, 수수료 다 빼고 진짜 남는 돈' },
              { icon: '\uD83D\uDCCA', title: '업종 평균 비교', desc: '같은 일 하는 분들과 비교해서 어디서 새는지' },
              { icon: '\uD83E\uDD16', title: 'AI 맞춤 조언', desc: '내 상황에 딱 맞는 절세/절감 방법' },
              { icon: '\uD83D\uDC64', title: '전문가 연결', desc: '세무사/노무사에게 내 데이터로 바로 상담' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-2.5">
                <span className="text-lg">{f.icon}</span>
                <div>
                  <p className="font-semibold" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>{f.title}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-hint)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href="/calc"
          className="block w-full py-3.5 rounded-xl text-white font-bold text-center hover:opacity-90 transition-opacity shadow-lg mb-6"
          style={{ background: 'var(--accent)', fontSize: 'var(--font-size-base)' }}>
          내 손에 남는 돈 계산하기 {"\u2192"}
        </Link>

        <div className="text-center pb-6">
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-hint)' }}>
            혼자 고민하지 마세요. 숫자를 알면 길이 보입니다.
          </p>
          <p className="font-semibold mt-1" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            pro.genomic.cc
          </p>
        </div>
      </div>
    </div>
  );
}
