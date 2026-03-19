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

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-gray-400">{dateStr}</p>
            <h1 className="text-lg font-bold text-gray-800 mt-0.5">{greeting}</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
            {"\uD83D\uDCB0"}
          </div>
        </div>

        {/* Today's Quote */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 mb-4">
          <p className="text-xs text-amber-600 font-semibold mb-2">{"\u2728"} 오늘의 한마디</p>
          <p className="text-gray-800 font-medium leading-relaxed text-lg">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs text-gray-400 mt-2 text-right">- {quote.author}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link
            href="/calc"
            className="bg-blue-600 text-white rounded-2xl p-5 shadow-sm hover:bg-blue-700 transition-colors group"
          >
            <span className="text-3xl block mb-2">{"\uD83E\uDDEE"}</span>
            <span className="font-bold text-base">실수령액 계산</span>
            <span className="block text-blue-200 text-xs mt-1">내 손에 얼마 남을까?</span>
          </Link>
          <Link
            href="/history"
            className="bg-emerald-600 text-white rounded-2xl p-5 shadow-sm hover:bg-emerald-700 transition-colors group"
          >
            <span className="text-3xl block mb-2">{"\uD83D\uDCCA"}</span>
            <span className="font-bold text-base">월별 추이</span>
            <span className="block text-emerald-200 text-xs mt-1">지난달보다 나아졌을까?</span>
          </Link>
        </div>

        {/* Today's Tip */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 mb-4">
          <p className="text-xs text-blue-600 font-semibold mb-2">{"\uD83D\uDCA1"} 오늘의 경영 팁</p>
          <p className="font-bold text-gray-800 mb-1">{tip.title}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{tip.body}</p>
        </div>

        {/* Service Features */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h2 className="font-bold text-gray-800 mb-4">이런 걸 도와드려요</h2>
          <div className="space-y-3">
            {[
              { icon: '\uD83E\uDDEE', title: '실수령액 자동 계산', desc: '매출 입력하면 세금, 보험, 원가 빼고 진짜 남는 돈을 알려드려요' },
              { icon: '\uD83D\uDCCA', title: '업종 평균 비교', desc: '같은 업종 사장님들과 비교해서 어디서 돈이 새는지 찾아드려요' },
              { icon: '\uD83E\uDD16', title: 'AI 경영 조언', desc: '내 숫자를 분석해서 지금 당장 할 수 있는 절세/절감 방법을 알려드려요' },
              { icon: '\uD83D\uDC64', title: '전문가 바로 연결', desc: '세무사, 노무사, 변호사에게 내 경영 데이터와 함께 상담 신청' },
              { icon: '\u23F0', title: '시간당 수익 계산', desc: '사장님의 시간은 소중합니다. 시급이 최저시급보다 높은지 확인하세요' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/calc"
          className="block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg text-center hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 mb-4"
        >
          지금 바로 계산해보기 {"\u2192"}
        </Link>

        {/* Trust Signals */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-600">5개</p>
            <p className="text-xs text-gray-500">업종 지원</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">무료</p>
            <p className="text-xs text-gray-500">완전 무료</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-600">AI</p>
            <p className="text-xs text-gray-500">맞춤 조언</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400">
            사장님의 든든한 경영 파트너
          </p>
          <p className="text-sm font-semibold text-gray-600 mt-1">
            profit.genomic.cc
          </p>
        </div>
      </div>
    </div>
  );
}
