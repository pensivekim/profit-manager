'use client';

import { useState, useEffect } from 'react';
import { fmtComma } from '@/lib/format';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface MonthlyRecord {
  year_month: string;
  revenue: number;
  final_profit: number;
  hourly_wage: number;
  cost_rent: number;
  cost_labor: number;
  cost_material: number;
  cost_other: number;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history?businessId=guest')
      .then((r) => r.json())
      .then((data) => setRecords(data.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">월별 내역</h1>
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-3xl mb-3">{"\uD83D\uDCCA"}</p>
            <p className="text-gray-600 mb-2">아직 기록이 없습니다</p>
            <p className="text-sm text-gray-400 mb-4">메인 페이지에서 계산하면 자동 저장됩니다</p>
            <a href="/" className="inline-block py-2.5 px-6 rounded-xl bg-blue-600 text-white font-semibold">
              계산하러 가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  const labels = records.map((r) => r.year_month);
  const profits = records.map((r) => r.final_profit);

  const chartData = {
    labels,
    datasets: [
      {
        label: '실수령액',
        data: profits,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: profits.map((p) => (p < 0 ? '#ef4444' : '#2563eb')),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => `${fmtComma(ctx.parsed.y ?? 0)}원`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => {
            const n = typeof value === 'string' ? parseInt(value) : value;
            if (Math.abs(n) >= 10000) return `${Math.round(n / 10000)}만`;
            return fmtComma(n);
          },
        },
      },
    },
  } as const;

  // 전월 대비 증감
  const changes: { month: string; diff: number; pct: number }[] = [];
  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1].final_profit;
    const curr = records[i].final_profit;
    const diff = curr - prev;
    const pct = prev !== 0 ? Math.round((diff / Math.abs(prev)) * 100) : 0;
    changes.push({ month: records[i].year_month, diff, pct });
  }

  // 위험 경보: 연속 감소 추세
  let declineCount = 0;
  for (let i = profits.length - 1; i > 0; i--) {
    if (profits[i] < profits[i - 1]) declineCount++;
    else break;
  }
  const lastProfit = profits[profits.length - 1];
  const avgDecline = declineCount > 0 && profits.length > 1
    ? Math.round((profits[profits.length - 1 - declineCount] - lastProfit) / declineCount)
    : 0;
  const monthsToZero = lastProfit > 0 && avgDecline > 0
    ? Math.ceil(lastProfit / avgDecline)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">월별 내역</h1>
          <a href="/" className="text-sm text-blue-600 font-medium">
            {"\u2190"} 계산기
          </a>
        </div>

        {/* 위험 경보 */}
        {declineCount >= 2 && monthsToZero > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
            <p className="font-bold text-red-700 text-sm">
              {"\uD83D\uDEA8"} {declineCount}개월 연속 하락 중
            </p>
            <p className="text-sm text-red-600 mt-1">
              이 추세면 약 {monthsToZero}개월 후 적자 전환 위험이 있습니다.
              전문가 상담을 권장합니다.
            </p>
          </div>
        )}

        {lastProfit < 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
            <p className="font-bold text-red-700 text-sm">
              {"\uD83D\uDEA8"} 현재 적자 상태입니다
            </p>
            <p className="text-sm text-red-600 mt-1">
              원가 절감 또는 매출 증대 전략이 시급합니다.
            </p>
          </div>
        )}

        {/* 차트 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">실수령액 추이</h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* 전월 대비 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">전월 대비 증감</h3>
          <div className="space-y-2">
            {changes.map((c) => (
              <div key={c.month} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{c.month}</span>
                <span className={`text-sm font-semibold ${c.diff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {c.diff >= 0 ? '+' : ''}{fmtComma(c.diff)}원 ({c.diff >= 0 ? '+' : ''}{c.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 월별 상세 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">월별 상세</h3>
          <div className="space-y-3">
            {[...records].reverse().map((r) => (
              <div key={r.year_month} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{r.year_month}</span>
                  <span className={`font-bold text-sm ${r.final_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmtComma(r.final_profit)}원
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>매출 {fmtComma(r.revenue)}</span>
                  <span>시급 {fmtComma(r.hourly_wage)}원</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
