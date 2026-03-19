'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { fmtComma } from '@/lib/format';

const BIZ_OPTIONS: { value: BizType; label: string }[] = [
  { value: 'beauty', label: '미용실/뷰티' },
  { value: 'restaurant', label: '식당/카페' },
  { value: 'retail', label: '소매/편의점' },
  { value: 'manufacture', label: '제조/공방' },
  { value: 'service', label: '서비스/학원/세탁' },
  { value: 'delivery', label: '배달/퀵/대리운전' },
  { value: 'freelance', label: '프리랜서/1인사업' },
  { value: 'directsales', label: '방문판매/네트워크마케팅' },
  { value: 'gig', label: '특수고용/플랫폼노동' },
];

function getWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const mon = new Date(now);
  mon.setDate(now.getDate() - diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return `${mon.getMonth() + 1}/${mon.getDate()} ~ ${sun.getMonth() + 1}/${sun.getDate()}`;
}

function calcDefaults(biz: BizType, rev: number) {
  const bm = BENCHMARKS[biz];
  return {
    costRent: Math.round(rev * bm.rent / 100),
    costLabor: Math.round(rev * bm.labor / 100),
    costMaterial: Math.round(rev * bm.material / 100),
    costOther: Math.round(rev * bm.other / 100),
  };
}

export default function WeeklyPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bizType, setBizType] = useState<BizType>('restaurant');
  const [taxType, setTaxType] = useState<'general' | 'simplified'>('general');
  const [revenue, setRevenue] = useState(5000000);
  const d = calcDefaults('restaurant', 5000000);
  const [costRent, setCostRent] = useState(d.costRent);
  const [costLabor, setCostLabor] = useState(d.costLabor);
  const [costMaterial, setCostMaterial] = useState(d.costMaterial);
  const [costOther, setCostOther] = useState(d.costOther);
  const [empCount, setEmpCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ finalProfit: number; hourlyWage: number } | null>(null);

  const applyDefaults = useCallback((biz: BizType, rev: number) => {
    const dd = calcDefaults(biz, rev);
    setCostRent(dd.costRent);
    setCostLabor(dd.costLabor);
    setCostMaterial(dd.costMaterial);
    setCostOther(dd.costOther);
  }, []);

  const handleSubmit = async () => {
    if (!phone.trim()) { alert('전화번호를 입력해주세요'); return; }
    if (!revenue) { alert('매출을 입력해주세요'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone: phone.replace(/-/g, ''), bizType, taxType, revenue,
          costRent, costLabor, costMaterial, costOther, empCount,
          workDays: 6, workHours: 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ finalProfit: data.finalProfit, hourlyWage: data.hourlyWage });
        setDone(true);
      } else {
        alert(data.error || '저장 실패');
      }
    } catch {
      alert('서버 오류');
    } finally {
      setLoading(false);
    }
  };

  const weekLabel = getWeekLabel();
  const bm = BENCHMARKS[bizType];

  const inputStyle = "w-full rounded-lg border border-[#e0d5c5] bg-[#FFFDF7] px-4 py-3 text-[#3a3025] focus:border-[#2D5A8E] focus:ring-1 focus:ring-[#2D5A8E] outline-none";

  if (done && result) {
    const isLoss = result.finalProfit < 0;
    return (
      <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <p className="text-5xl mb-4">{isLoss ? '\uD83D\uDE1F' : '\uD83C\uDF89'}</p>
          <h2 className="font-bold text-[#3a3025] mb-2" style={{ fontSize: '20px', lineHeight: '1.8' }}>
            이번 주 기록 완료!
          </h2>
          <div className={`rounded-2xl p-6 text-white mb-4 ${isLoss ? 'bg-red-500' : 'bg-[#2D5A8E]'}`}>
            <p className="opacity-80 mb-1" style={{ fontSize: '16px' }}>이번 주 실수령액</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{fmtComma(result.finalProfit)}원</p>
            <p className="opacity-70 mt-2" style={{ fontSize: '16px' }}>시간당 {fmtComma(result.hourlyWage)}원</p>
          </div>
          <p className="text-[#5a4a3a] mb-6" style={{ fontSize: '16px', lineHeight: '1.8' }}>
            매주 금요일 저녁에 성적표를 보내드릴게요!
          </p>
          <div className="space-y-3">
            <Link href="/calc" className="block w-full py-3.5 rounded-xl bg-[#2D5A8E] text-white font-bold" style={{ fontSize: '16px', minHeight: '48px', lineHeight: '2.5' }}>
              상세 분석 보기
            </Link>
            <Link href="/" className="block w-full py-3.5 rounded-xl border-2 border-[#2D5A8E] text-[#2D5A8E] font-bold" style={{ fontSize: '16px', minHeight: '48px', lineHeight: '2.5' }}>
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="text-base text-[#2D5A8E] font-semibold">{"\u2190"} 홈</Link>
          <div className="text-center flex-1">
            <h1 className="font-bold text-[#3a3025]" style={{ fontSize: '18px', lineHeight: '1.8' }}>이번 주 매출 입력</h1>
            <p className="text-[#a09080]" style={{ fontSize: '14px' }}>{weekLabel}</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="rounded-2xl p-5 shadow-sm border border-[#e0d5c5] space-y-4" style={{ background: '#FFFDF7' }}>
          {/* 이름/전화 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="사장님 성함"
                className={inputStyle} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>전화번호</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678"
                className={inputStyle} style={{ fontSize: '16px' }} />
            </div>
          </div>

          {/* 업종 */}
          <div>
            <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>업종</label>
            <select value={bizType} onChange={(e) => { const b = e.target.value as BizType; setBizType(b); applyDefaults(b, revenue); }}
              className={inputStyle} style={{ fontSize: '16px' }}>
              {BIZ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* 과세유형 */}
          <div className="grid grid-cols-2 gap-2">
            {(['general', 'simplified'] as const).map((t) => (
              <button key={t} onClick={() => setTaxType(t)}
                className={`py-3 rounded-lg font-semibold transition-all ${taxType === t ? 'bg-[#2D5A8E] text-white' : 'bg-[#F5F0E8] text-[#5a4a3a]'}`}
                style={{ fontSize: '16px', minHeight: '48px' }}>
                {t === 'general' ? '일반과세' : '간이과세'}
              </button>
            ))}
          </div>

          {/* 매출 */}
          <div>
            <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>이번 주 매출</label>
            <div className="relative">
              <input type="number" value={revenue} onChange={(e) => { const r = Number(e.target.value); setRevenue(r); applyDefaults(bizType, r); }}
                step={100000} className={`${inputStyle} text-right`} style={{ fontSize: '16px' }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09080] text-sm">원</span>
            </div>
            <p className="text-sm text-[#a09080] mt-1 text-right">{fmtComma(revenue)}원</p>
          </div>

          {/* 지출 */}
          <div className="pt-3 border-t border-[#e0d5c5]">
            <p className="font-bold text-[#3a3025] mb-2" style={{ fontSize: '16px' }}>이번 주 지출</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: `임대료 (평균${bm.rent}%)`, val: costRent, set: setCostRent },
                { label: `인건비 (평균${bm.labor}%)`, val: costLabor, set: setCostLabor },
                { label: `재료비 (평균${bm.material}%)`, val: costMaterial, set: setCostMaterial },
                { label: `기타 (평균${bm.other}%)`, val: costOther, set: setCostOther },
              ].map((c) => (
                <div key={c.label}>
                  <label className="block text-[#5a4a3a] mb-1" style={{ fontSize: '14px' }}>{c.label}</label>
                  <input type="number" value={c.val} onChange={(e) => c.set(Number(e.target.value))}
                    step={50000} className={`${inputStyle} text-right`} style={{ fontSize: '16px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* 직원 */}
          <div>
            <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>직원 수</label>
            <input type="number" value={empCount} onChange={(e) => setEmpCount(Number(e.target.value))}
              className={`${inputStyle} text-right`} style={{ fontSize: '16px' }} />
          </div>

          {/* 제출 */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 rounded-xl bg-[#2D5A8E] text-white font-bold hover:bg-[#24496f] disabled:opacity-50 transition-colors"
            style={{ fontSize: '18px', minHeight: '48px' }}>
            {loading ? '저장 중...' : '이번 주 기록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
