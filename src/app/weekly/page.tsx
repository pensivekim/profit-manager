'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fmtComma } from '@/lib/format';

function getWeekRange(): { label: string; start: string } {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const mon = new Date(now);
  mon.setDate(now.getDate() - diff);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const label = `${mon.getMonth() + 1}/${mon.getDate()}(${days[mon.getDay()]}) ~ ${fri.getMonth() + 1}/${fri.getDate()}(${days[fri.getDay()]})`;
  return { label, start: mon.toISOString().slice(0, 10) };
}

interface WeeklyResult {
  finalProfit: number;
  hourlyWage: number;
  aiComment: string;
  diff: string;
  userName: string;
  costBasis?: 'custom' | 'average';
}

export default function WeeklyPage() {
  const [revenue, setRevenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeeklyResult | null>(null);
  const [userId, setUserId] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const week = useMemo(() => getWeekRange(), []);

  // URL ?t= 파라미터로 자동 로그인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('t');
    if (token) {
      setUserId(token);
      localStorage.setItem('pro_user_id', token);
    } else {
      const saved = localStorage.getItem('pro_user_id');
      if (saved) {
        setUserId(saved);
      } else {
        setIsNewUser(true);
      }
    }
  }, []);

  // 신규 사용자: 설정 페이지로
  if (isNewUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-4xl mb-4">{"\uD83D\uDC4B"}</p>
          <h2 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
            처음이시네요!
          </h2>
          <p className="mb-6" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>
            1분만 투자해서 기본 정보를 설정하면<br />
            매주 매출만 입력하시면 돼요.
          </p>
          <Link href="/settings" className="block w-full py-4 rounded-xl text-white font-bold"
            style={{ fontSize: 'var(--font-size-lg)', minHeight: '52px', lineHeight: '2.2', background: 'var(--accent)' }}>
            기본 설정하기
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    const rev = Number(revenue.replace(/,/g, ''));
    if (!rev || rev <= 0) { alert('매출을 입력해주세요'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, revenue: rev }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.error || '저장 실패');
      }
    } catch {
      alert('서버 오류');
    } finally {
      setLoading(false);
    }
  };

  // 결과 화면
  if (result) {
    const isLoss = result.finalProfit < 0;
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* AI 한마디 */}
          {result.aiComment && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--success-light)', lineHeight: 'var(--line-height)' }}>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--success)' }}>
                {"\uD83E\uDD16"} {result.aiComment}
              </p>
            </div>
          )}

          {/* 실수령액 */}
          <div className={`rounded-2xl p-6 text-white text-center mb-4 ${isLoss ? 'bg-red-500' : ''}`} style={{ background: isLoss ? undefined : 'var(--accent)' }}>
            <p className="opacity-80 mb-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)' }}>
              {result.userName}님, 이번 주 실수령 예상액
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', lineHeight: '1.3' }}>
              {fmtComma(result.finalProfit)}원
            </p>
            <div className="flex justify-center gap-6 mt-4 opacity-80" style={{ fontSize: 'var(--font-size-base)' }}>
              <span>시급 {fmtComma(result.hourlyWage)}원</span>
              <span>{result.diff}</span>
            </div>
          </div>

          {/* 계산 기준 안내 */}
          {result.costBasis === 'custom' ? (
            <div className="rounded-xl px-4 py-3 flex items-center gap-2 mb-4" style={{ background: 'rgba(46,125,79,0.08)', border: '1px solid rgba(46,125,79,0.15)' }}>
              <span style={{ fontSize: '14px' }}>{"\u2705"}</span>
              <p style={{ fontSize: '13px', color: '#2E7D4F', lineHeight: '1.5' }}>
                내 고정비용 기준 계산
              </p>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-3 flex items-start gap-2 mb-4" style={{ background: 'rgba(45,90,142,0.08)', border: '1px solid rgba(45,90,142,0.15)' }}>
              <span style={{ fontSize: '14px' }}>{"\uD83D\uDCCC"}</span>
              <p style={{ fontSize: '13px', color: '#2D5A8E', lineHeight: '1.5' }}>
                업종 평균 기준 계산입니다.{' '}
                <Link href="/settings" className="font-bold underline">내 비용 입력하면 더 정확해요</Link>
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="space-y-3">
            <Link href="/calc" className="block w-full py-4 rounded-xl text-white font-bold text-center"
              style={{ fontSize: 'var(--font-size-base)', minHeight: '52px', lineHeight: '2.2', background: 'var(--accent)' }}>
              자세한 분석 보기
            </Link>
            <Link href="/" className="block w-full py-4 rounded-xl border-2 font-bold text-center"
              style={{ fontSize: 'var(--font-size-base)', minHeight: '52px', lineHeight: '2.2', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 입력 화면 (매출 1개만)
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-6 flex-1 flex flex-col">
        {/* 상단 */}
        <div className="text-center mb-8 pt-4">
          <h1 className="font-bold" style={{ fontSize: 'var(--font-size-xl)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
            이번 주 매출 입력
          </h1>
          <p className="mt-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>
            {week.label}
          </p>
        </div>

        {/* 매출 입력 - 딱 1개 */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="rounded-2xl p-6 border border-border" style={{ background: 'var(--bg-card)' }}>
            <label className="block font-bold mb-3 text-center" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
              이번 주 총 매출이 얼마인가요?
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={revenue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setRevenue(raw ? Number(raw).toLocaleString('ko-KR') : '');
                }}
                placeholder="0"
                autoFocus
                className="w-full rounded-xl border-2 bg-white px-5 text-right font-bold focus:ring-2 outline-none"
                style={{ fontSize: 'var(--font-size-xl)', height: '64px', lineHeight: '1.5', borderColor: 'var(--accent)', color: 'var(--text-primary)' }}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-hint)' }}>원</span>
            </div>

            <p className="text-center mt-3" style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>
              비용은 처음 설정한 고정값이 적용돼요
            </p>
            <div className="text-center mt-1">
              <Link href="/settings" className="font-semibold" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)' }}>
                비용 수정 {"\u2192"}
              </Link>
            </div>
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className="pb-6 pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !revenue}
            className="w-full rounded-xl text-white font-bold disabled:opacity-40 transition-colors"
            style={{ fontSize: 'var(--font-size-lg)', height: '56px', lineHeight: '1.5', background: 'var(--accent)' }}
          >
            {loading ? '계산 중...' : '완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
