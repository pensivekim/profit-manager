'use client';

import { fmtComma } from '@/lib/format';

interface Props {
  finalProfit: number;
  hourlyWage: number;
  totalHours: number;
  revenue: number;
  opCost: number;
  totalTax: number;
}

const MIN_WAGE = 10030;

export default function ResultSummary({ finalProfit, hourlyWage, totalHours, revenue, opCost, totalTax }: Props) {
  const isLoss = finalProfit < 0;
  const belowMinWage = hourlyWage > 0 && hourlyWage < MIN_WAGE;
  const wageDiff = hourlyWage - MIN_WAGE;

  return (
    <div className="space-y-3">
      {/* 실수령액 강조 */}
      <div
        className={`rounded-2xl p-6 text-white ${isLoss ? 'bg-red-500' : 'bg-[#2D5A8E]'}`}
        style={{ lineHeight: '1.8' }}
      >
        <p className="text-base opacity-80 mb-1">
          {isLoss ? '이번 달 적자입니다' : '이번 달 내 손에 남는 돈'}
        </p>
        <p style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1.3' }}>
          {fmtComma(finalProfit)}원
        </p>

        {/* 시급 */}
        <div
          className={`mt-4 rounded-xl p-4 ${belowMinWage ? 'bg-amber-500/90' : 'bg-white/15'}`}
          style={{ lineHeight: '1.8' }}
        >
          <p className="text-base opacity-90 mb-0.5">시간당 수익</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.3' }}>
            {fmtComma(hourlyWage)}원
          </p>
          <p className="text-base opacity-80 mt-1">
            최저임금 {fmtComma(MIN_WAGE)}원 대비{' '}
            <span className="font-bold">
              {wageDiff >= 0 ? '+' : ''}{fmtComma(wageDiff)}원
            </span>
          </p>
          {belowMinWage && (
            <p className="text-base font-bold mt-1">
              {"\u26A0\uFE0F"} 최저임금보다 낮습니다. 원가 점검이 필요합니다.
            </p>
          )}
          <p className="text-sm opacity-60 mt-1">월 {totalHours}시간 근무 기준</p>
        </div>
      </div>

      {/* 요약 카드 3개 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 border border-[#e0d5c5] text-center" style={{ background: '#FFFDF7', lineHeight: '1.8' }}>
          <p className="text-sm text-[#a09080]">매출</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2D5A8E' }}>{fmtComma(revenue)}원</p>
        </div>
        <div className="rounded-xl p-3 border border-[#e0d5c5] text-center" style={{ background: '#FFFDF7', lineHeight: '1.8' }}>
          <p className="text-sm text-[#a09080]">운영비</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#5a4a3a' }}>{fmtComma(opCost)}원</p>
        </div>
        <div className="rounded-xl p-3 border border-[#e0d5c5] text-center" style={{ background: '#FFFDF7', lineHeight: '1.8' }}>
          <p className="text-sm text-[#a09080]">세금합계</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>{fmtComma(totalTax)}원</p>
        </div>
      </div>
    </div>
  );
}
