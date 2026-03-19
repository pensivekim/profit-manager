'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fmtComma } from '@/lib/format';
import { checkAlerts, checkMissingWeeks } from '@/lib/alerts';
import type { WeeklyRecord, Alert } from '@/lib/alerts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler);

interface MonthlyRecord {
  year_month: string;
  revenue: number;
  final_profit: number;
  hourly_wage: number;
  week_count?: number;
}

function weekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const weekNum = Math.ceil(d.getDate() / 7);
  return `${month}/${weekNum}주`;
}

function yTickFmt(value: string | number): string {
  const n = typeof value === 'string' ? parseInt(value) : value;
  if (Math.abs(n) >= 10000) return `${Math.round(n / 10000)}만`;
  return fmtComma(n);
}

export default function HistoryPage() {
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyRecord | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('pro_user_id') || '';
    Promise.all([
      fetch(`/api/history?type=weekly&weeks=8&userId=${userId}`).then(r => r.json()),
      fetch(`/api/history?type=monthly&months=6&userId=${userId}`).then(r => r.json()),
    ]).then(([w, m]) => {
      setWeeklyRecords(w.records || []);
      setMonthlyRecords(m.records || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-hint)' }}>불러오는 중...</p>
      </div>
    );
  }

  const noData = weeklyRecords.length === 0 && monthlyRecords.length === 0;
  if (noData) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="rounded-2xl p-8 text-center border border-border" style={{ background: 'var(--bg-card)' }}>
            <p className="text-4xl mb-3">{"\uD83D\uDCCA"}</p>
            <p className="font-bold mb-2" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>아직 기록이 없습니다</p>
            <p className="mb-4" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>매주 매출을 입력하면 추이를 볼 수 있어요</p>
            <Link href="/weekly" className="inline-block py-3 px-8 rounded-xl text-white font-bold" style={{ fontSize: 'var(--font-size-base)', minHeight: '48px', background: 'var(--accent)' }}>
              매출 입력하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 경보 체크
  const alerts: Alert[] = [...checkAlerts(weeklyRecords)];
  const missingAlert = checkMissingWeeks(weeklyRecords);
  if (missingAlert) alerts.push(missingAlert);

  // 주별 차트용 데이터 (오래된 순)
  const weeklyAsc = [...weeklyRecords].reverse();
  const weekLabels = weeklyAsc.map(r => weekLabel(r.week_start));
  const weekProfits = weeklyAsc.map(r => r.final_profit);

  // 주별 요약
  const recent4 = weeklyRecords.slice(0, 4);
  const avg4 = recent4.length > 0 ? Math.round(recent4.reduce((s, r) => s + r.final_profit, 0) / recent4.length) : 0;
  const best = weeklyRecords.length > 0 ? weeklyRecords.reduce((b, r) => r.final_profit > b.final_profit ? r : b) : null;
  const worst = weeklyRecords.length > 0 ? weeklyRecords.reduce((w, r) => r.final_profit < w.final_profit ? r : w) : null;

  // 이번 달 누적
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthTotal = weeklyRecords.filter(r => r.week_start.startsWith(thisMonth)).reduce((s, r) => s + r.final_profit, 0);

  // 월별 차트용 데이터
  const monthlyAsc = [...monthlyRecords].reverse();
  const monthLabels = monthlyAsc.map(r => r.year_month);
  const monthProfits = monthlyAsc.map(r => r.final_profit);

  const weeklyChartData = {
    labels: weekLabels,
    datasets: [{
      label: '실수령액',
      data: weekProfits,
      borderColor: '#2D5A8E',
      backgroundColor: 'rgba(45, 90, 142, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 6,
      pointHoverRadius: 9,
      pointBackgroundColor: weekProfits.map(p => p < 0 ? '#ef4444' : '#2D5A8E'),
    }],
  };

  const monthlyChartData = {
    labels: monthLabels,
    datasets: [{
      label: '실수령액',
      data: monthProfits,
      backgroundColor: monthProfits.map(p => p < 0 ? '#ef4444' : '#2D5A8E'),
      borderRadius: 8,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => `${fmtComma(ctx.parsed.y ?? 0)}원`,
        },
      },
    },
    scales: {
      y: { ticks: { callback: yTickFmt } },
    },
    onClick: (_: unknown, elements: { index: number }[]) => {
      if (elements.length > 0 && tab === 'weekly') {
        setSelectedWeek(weeklyAsc[elements[0].index]);
      }
    },
  } as const;

  const alertBg = { danger: 'bg-red-500 text-white', warning: 'bg-amber-500 text-white', info: '' };
  const alertIcon = { danger: '\uD83D\uDEA8', warning: '\u26A0\uFE0F', info: '\uD83D\uDCDD' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="font-semibold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--accent)' }}>{"\u2190"} 홈</Link>
          <h1 className="font-bold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>내 추이</h1>
          <Link href="/weekly" className="font-semibold" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)' }}>입력 {"\u2192"}</Link>
        </div>

        {/* 경보 배너 */}
        {alerts.map((a, i) => (
          <div key={i} className={`rounded-xl p-4 mb-3 ${a.type === 'info' ? '' : alertBg[a.type]}`}
            style={{ lineHeight: 'var(--line-height)', ...(a.type === 'info' ? { background: 'var(--accent-light)', color: 'var(--accent)' } : {}) }}>
            <p className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
              {alertIcon[a.type]} {a.msg}
            </p>
            {a.link && (
              <Link href={a.link} className="underline font-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>
                확인하기 {"\u2192"}
              </Link>
            )}
          </div>
        ))}

        {/* 탭 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['weekly', 'monthly'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelectedWeek(null); }}
              className={`py-3 rounded-xl font-bold transition-all ${tab === t ? 'text-white' : ''}`}
              style={{ fontSize: 'var(--font-size-base)', minHeight: '48px', background: tab === t ? 'var(--accent)' : 'var(--bg-card)', color: tab === t ? undefined : 'var(--text-secondary)' }}>
              {t === 'weekly' ? '주별 추이' : '월별 추이'}
            </button>
          ))}
        </div>

        {/* 주별 탭 */}
        {tab === 'weekly' && (
          <>
            {/* 차트 */}
            <div className="rounded-2xl p-4 border border-border mb-4" style={{ background: 'var(--bg-card)', height: '280px' }}>
              <h3 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>주별 실수령액</h3>
              <div style={{ height: '220px' }}>
                <Line data={weeklyChartData} options={chartOpts} />
              </div>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-xl p-4 border border-border" style={{ background: 'var(--bg-card)', lineHeight: 'var(--line-height)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>최근 4주 평균</p>
                <p className="font-bold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--accent)' }}>{fmtComma(avg4)}원</p>
              </div>
              <div className="rounded-xl p-4 border border-border" style={{ background: 'var(--bg-card)', lineHeight: 'var(--line-height)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>이번 달 누적</p>
                <p className="font-bold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>{fmtComma(thisMonthTotal)}원</p>
              </div>
              {best && (
                <div className="rounded-xl p-4 border border-border" style={{ background: 'var(--bg-card)', lineHeight: 'var(--line-height)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>최고 주</p>
                  <p className="font-bold text-emerald-600" style={{ fontSize: 'var(--font-size-base)' }}>{weekLabel(best.week_start)} {fmtComma(best.final_profit)}원</p>
                </div>
              )}
              {worst && (
                <div className="rounded-xl p-4 border border-border" style={{ background: 'var(--bg-card)', lineHeight: 'var(--line-height)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>최저 주</p>
                  <p className="font-bold text-red-500" style={{ fontSize: 'var(--font-size-base)' }}>{weekLabel(worst.week_start)} {fmtComma(worst.final_profit)}원</p>
                </div>
              )}
            </div>

            {/* 주 클릭 상세 */}
            {selectedWeek && (
              <div className="rounded-2xl p-5 border-2 mb-4" style={{ background: 'var(--bg-card)', lineHeight: 'var(--line-height)', borderColor: 'var(--accent)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>{weekLabel(selectedWeek.week_start)} 상세</h4>
                  <button onClick={() => setSelectedWeek(null)} className="text-xl" style={{ color: 'var(--text-hint)' }}>&times;</button>
                </div>
                <div className="grid grid-cols-2 gap-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                  <div>매출: <span className="font-bold">{fmtComma(selectedWeek.revenue)}원</span></div>
                  <div>실수령: <span className="font-bold">{fmtComma(selectedWeek.final_profit)}원</span></div>
                  <div>시급: <span className="font-bold">{fmtComma(selectedWeek.hourly_wage)}원</span></div>
                  <div>임대: <span className="font-bold">{fmtComma(selectedWeek.cost_rent || 0)}원</span></div>
                  <div>인건비: <span className="font-bold">{fmtComma(selectedWeek.cost_labor || 0)}원</span></div>
                  <div>재료비: <span className="font-bold">{fmtComma(selectedWeek.cost_material || 0)}원</span></div>
                </div>
                {selectedWeek.ai_comment && (
                  <div className="mt-3 rounded-lg p-3" style={{ background: '#e8f5e9' }}>
                    <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--success)' }}>{"\uD83E\uDD16"} {selectedWeek.ai_comment}</p>
                  </div>
                )}
              </div>
            )}

            {/* 주별 리스트 */}
            <div className="space-y-2">
              {weeklyRecords.map((r, i) => {
                const prev = weeklyRecords[i + 1];
                const diff = prev ? r.final_profit - prev.final_profit : 0;
                return (
                  <button key={r.week_start} onClick={() => setSelectedWeek(r)}
                    className="w-full rounded-xl p-4 border border-border text-left"
                    style={{ background: 'var(--bg-card)', lineHeight: 'var(--line-height)' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>{weekLabel(r.week_start)}</span>
                      <div className="text-right">
                        <span className={`font-bold ${r.final_profit >= 0 ? '' : 'text-red-500'}`} style={{ fontSize: 'var(--font-size-base)', color: r.final_profit >= 0 ? 'var(--accent)' : undefined }}>
                          {fmtComma(r.final_profit)}원
                        </span>
                        {prev && (
                          <span className={`ml-2 ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`} style={{ fontSize: 'var(--font-size-sm)' }}>
                            {diff >= 0 ? '\u25B2' : '\u25BC'}{fmtComma(Math.abs(diff))}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* 월별 탭 */}
        {tab === 'monthly' && (
          <>
            <div className="rounded-2xl p-4 border border-border mb-4" style={{ background: 'var(--bg-card)', height: '280px' }}>
              <h3 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>월별 실수령액</h3>
              <div style={{ height: '220px' }}>
                <Bar data={monthlyChartData} options={chartOpts} />
              </div>
            </div>

            <div className="space-y-2">
              {monthlyRecords.map((r, i) => {
                const prev = monthlyRecords[i + 1];
                const diff = prev ? (r.final_profit as number) - (prev.final_profit as number) : 0;
                return (
                  <div key={r.year_month} className="rounded-xl p-4 border border-border"
                    style={{ background: 'var(--bg-card)', lineHeight: 'var(--line-height)' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>{r.year_month}</span>
                        {r.week_count && <span className="ml-2" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>({r.week_count}주)</span>}
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${(r.final_profit as number) >= 0 ? '' : 'text-red-500'}`} style={{ fontSize: 'var(--font-size-base)', color: (r.final_profit as number) >= 0 ? 'var(--accent)' : undefined }}>
                          {fmtComma(r.final_profit as number)}원
                        </span>
                        {prev && (
                          <span className={`ml-2 ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`} style={{ fontSize: 'var(--font-size-sm)' }}>
                            {diff >= 0 ? '\u25B2' : '\u25BC'}{fmtComma(Math.abs(diff))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
