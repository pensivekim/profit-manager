'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { RegionCode, REGION_LIST } from '@/lib/regions';

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

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bizType, setBizType] = useState<BizType>('restaurant');
  const [region, setRegion] = useState<RegionCode>('daegu');
  const [taxType, setTaxType] = useState<'general' | 'simplified'>('general');
  const [empCount, setEmpCount] = useState(0);
  const [workDays, setWorkDays] = useState(25);
  const [workHours, setWorkHours] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingUserId, setExistingUserId] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('pro_user_id');
    if (saved) {
      setExistingUserId(saved);
      fetch(`/api/settings?userId=${saved}`).then(r => r.json()).then(data => {
        if (data.user) {
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
          setBizType(data.user.biz_type || 'restaurant');
          setRegion(data.user.region || 'daegu');
          setTaxType(data.user.tax_type || 'general');
          setEmpCount(data.user.emp_count || 0);
          setWorkDays(data.user.work_days || 25);
          setWorkHours(data.user.work_hours || 10);
        }
      }).catch(() => {});
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !phone.trim()) { alert('이름과 전화번호를 입력해주세요'); return; }
    setLoading(true);
    const normalizedPhone = phone.replace(/-/g, '');
    const userId = existingUserId || `user-${normalizedPhone}`;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, phone: normalizedPhone, bizType, region, taxType, empCount, workDays, workHours }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pro_user_id', userId);
        setSaved(true);
      } else {
        alert(data.error || '저장 실패');
      }
    } catch {
      alert('서버 오류');
    } finally {
      setLoading(false);
    }
  }, [name, phone, bizType, region, taxType, empCount, workDays, workHours, existingUserId]);

  const inputClass = "w-full rounded-lg border border-border px-4 outline-none";

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-5xl mb-4">{"\u2705"}</p>
          <h2 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
            설정 완료!
          </h2>
          <p className="mb-6" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>
            이제 매주 매출만 입력하시면 돼요.
          </p>
          <Link href="/weekly" className="block w-full py-4 rounded-xl text-white font-bold"
            style={{ fontSize: 'var(--font-size-lg)', minHeight: '52px', lineHeight: '2.2', background: 'var(--accent)' }}>
            이번 주 매출 입력하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="font-bold" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
            기본 설정
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>
            한 번만 입력하면 매주 자동 적용돼요
          </p>
        </div>

        <div className="rounded-2xl p-5 border border-border space-y-4" style={{ background: 'var(--bg-card)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                className={inputClass} style={{ fontSize: 'var(--font-size-base)', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>전화번호</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678"
                className={inputClass} style={{ fontSize: 'var(--font-size-base)', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>업종</label>
            <select value={bizType} onChange={(e) => setBizType(e.target.value as BizType)}
              className={inputClass} style={{ fontSize: 'var(--font-size-base)', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {BIZ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>{"\uD83D\uDCCD"} \uC0AC\uC5C5\uC7A5 \uC9C0\uC5ED</label>
            <select value={region} onChange={(e) => setRegion(e.target.value as RegionCode)}
              className={inputClass} style={{ fontSize: 'var(--font-size-base)', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {REGION_LIST.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>\uACFC\uC138\uC720\uD615</label>
            <div className="grid grid-cols-2 gap-2">
              {(['general', 'simplified'] as const).map((t) => (
                <button key={t} onClick={() => setTaxType(t)}
                  className={`rounded-lg font-semibold transition-all ${taxType === t ? 'text-white' : ''}`}
                  style={{ fontSize: 'var(--font-size-base)', height: '48px', background: taxType === t ? 'var(--accent)' : 'var(--bg-page)', color: taxType === t ? undefined : 'var(--text-secondary)' }}>
                  {t === 'general' ? '일반과세자' : '간이과세자'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>직원 수</label>
              <input type="number" value={empCount} onChange={(e) => setEmpCount(Number(e.target.value))}
                className={`${inputClass} text-right`} style={{ fontSize: 'var(--font-size-base)', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>월 근무일</label>
              <input type="number" value={workDays} onChange={(e) => setWorkDays(Number(e.target.value))}
                className={`${inputClass} text-right`} style={{ fontSize: 'var(--font-size-base)', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>일 근무시간</label>
              <input type="number" value={workHours} onChange={(e) => setWorkHours(Number(e.target.value))}
                className={`${inputClass} text-right`} style={{ fontSize: 'var(--font-size-base)', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <p className="text-center" style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>
            비용은 업종 평균({BENCHMARKS[bizType].name})으로 자동 계산돼요.<br />
            매출만 입력하면 나머지는 자동!
          </p>

          <button onClick={handleSave} disabled={loading}
            className="w-full rounded-xl text-white font-bold disabled:opacity-40 transition-colors"
            style={{ fontSize: 'var(--font-size-lg)', height: '56px', background: 'var(--accent)' }}>
            {loading ? '저장 중...' : '설정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
