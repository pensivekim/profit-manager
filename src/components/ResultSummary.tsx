'use client';

import { fmtKRW, fmtComma } from '@/lib/format';

interface Props {
  finalProfit: number;
  hourlyWage: number;
  totalHours: number;
  revenue: number;
}

export default function ResultSummary({ finalProfit, hourlyWage, totalHours, revenue }: Props) {
  const isLoss = finalProfit < 0;
  const profitRate = revenue > 0 ? Math.round((finalProfit / revenue) * 100) : 0;

  return (
    <div className={`rounded-2xl p-6 text-white ${isLoss ? 'bg-red-500' : 'bg-emerald-600'}`}>
      <p className="text-sm opacity-80 mb-1">
        {isLoss ? '이번 달 적자입니다' : '이번 달 실수령액'}
      </p>
      <p className="text-4xl font-bold mb-4">{fmtComma(finalProfit)}원</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/20 rounded-xl p-4 text-center">
          <p className="text-xs opacity-80 mb-1">시간당 수익</p>
          <p className="text-2xl font-bold">{fmtComma(hourlyWage)}원</p>
          <p className="text-xs opacity-70 mt-1">
            {totalHours}시간 근무 기준
          </p>
        </div>
        <div className="bg-white/20 rounded-xl p-4 text-center">
          <p className="text-xs opacity-80 mb-1">수익률</p>
          <p className="text-2xl font-bold">{profitRate}%</p>
          <p className="text-xs opacity-70 mt-1">
            매출 대비 순이익
          </p>
        </div>
      </div>

      {hourlyWage > 0 && hourlyWage < 10030 && (
        <div className="mt-4 bg-white/20 rounded-lg p-3 text-center text-sm">
          2025년 최저시급(10,030원)보다 낮습니다
        </div>
      )}
    </div>
  );
}
