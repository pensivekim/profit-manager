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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-blue-50">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Top */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400">{dateStr}</p>
            <h1 className="text-lg font-bold text-gray-800 mt-0.5">{greeting}</h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-xl">
            {"\uD83D\uDCB0"}
          </div>
        </div>

        {/* Quote */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 mb-4">
          <p className="text-xs text-amber-600 font-semibold mb-2">{"\u2728"} 오늘의 한마디</p>
          <p className="text-gray-800 font-medium leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs text-gray-400 mt-2 text-right">- {quote.author}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/calc" className="bg-blue-600 text-white rounded-2xl p-4 shadow-sm hover:bg-blue-700 transition-colors">
            <span className="text-2xl block mb-1">{"\uD83E\uDDEE"}</span>
            <span className="font-bold text-sm">실수령액 계산</span>
            <span className="block text-blue-200 text-xs mt-0.5">진짜 남는 돈 확인</span>
          </Link>
          <Link href="/history" className="bg-emerald-600 text-white rounded-2xl p-4 shadow-sm hover:bg-emerald-700 transition-colors">
            <span className="text-2xl block mb-1">{"\uD83D\uDCCA"}</span>
            <span className="font-bold text-sm">월별 추이</span>
            <span className="block text-emerald-200 text-xs mt-0.5">나아지고 있을까?</span>
          </Link>
        </div>

        {/* Tip */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 mb-4">
          <p className="text-xs text-blue-600 font-semibold mb-1">{"\uD83D\uDCA1"} 오늘의 경영 팁</p>
          <p className="font-bold text-gray-800 text-sm mb-1">{tip.title}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{tip.body}</p>
        </div>

        {/* Who is this for */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h2 className="font-bold text-gray-800 mb-1 text-sm">이런 분들을 위해 만들었어요</h2>
          <p className="text-xs text-gray-400 mb-3">매달 얼마 남는지 막막한 모든 분</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '\uD83C\uDF5C', label: '식당/카페\n사장님' },
              { icon: '\u2702\uFE0F', label: '미용실\n사장님' },
              { icon: '\uD83D\uDEB4', label: '배달/퀵\n라이더' },
              { icon: '\uD83D\uDC84', label: '방문판매\n설화수/애터미' },
              { icon: '\uD83D\uDCBB', label: '프리랜서\n1인사업' },
              { icon: '\uD83D\uDE95', label: '대리운전\n플랫폼노동' },
            ].map((p) => (
              <div key={p.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <span className="text-xl block">{p.icon}</span>
                <span className="text-xs text-gray-600 mt-1 block whitespace-pre-line leading-tight">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">무료로 이런 걸 해드려요</h2>
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
                  <p className="font-semibold text-gray-800 text-xs">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/calc"
          className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-center hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 mb-6"
        >
          내 손에 남는 돈 계산하기 {"\u2192"}
        </Link>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs text-gray-400">
            혼자 고민하지 마세요. 숫자를 알면 길이 보입니다.
          </p>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            pro.genomic.cc
          </p>
        </div>
      </div>
    </div>
  );
}
