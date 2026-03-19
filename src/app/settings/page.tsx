'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';

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
        body: JSON.stringify({ userId, name, phone: normalizedPhone, bizType, taxType, empCount, workDays, workHours }),
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
  }, [name, phone, bizType, taxType, empCount, workDays, workHours, existingUserId]);

  const inputClass = "w-full rounded-lg border border-[#e0d5c5] bg-[#FFFDF7] px-4 text-[#3a3025] focus:border-[#2D5A8E] focus:ring-1 focus:ring-[#2D5A8E] outline-none";

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-5xl mb-4">{"\u2705"}</p>
          <h2 className="font-bold text-[#3a3025] mb-2" style={{ fontSize: '20px', lineHeight: '1.8' }}>
            설정 완료!
          </h2>
          <p className="text-[#5a4a3a] mb-6" style={{ fontSize: '16px', lineHeight: '1.8' }}>
            이제 매주 매출만 입력하시면 돼요.
          </p>
          <Link href="/weekly" className="block w-full py-4 rounded-xl bg-[#2D5A8E] text-white font-bold"
            style={{ fontSize: '18px', minHeight: '52px', lineHeight: '2.2' }}>
            이번 주 매출 입력하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="font-bold text-[#3a3025]" style={{ fontSize: '20px', lineHeight: '1.8' }}>
            기본 설정
          </h1>
          <p className="text-[#a09080]" style={{ fontSize: '14px', lineHeight: '1.8' }}>
            한 번만 입력하면 매주 자동 적용돼요
          </p>
        </div>

        <div className="rounded-2xl p-5 border border-[#e0d5c5] space-y-4" style={{ background: '#FFFDF7' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                className={inputClass} style={{ fontSize: '16px', height: '48px' }} />
            </div>
            <div>
              <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>전화번호</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678"
                className={inputClass} style={{ fontSize: '16px', height: '48px' }} />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '16px' }}>업종</label>
            <select value={bizType} onChange={(e) => setBizType(e.target.value as BizType)}
              className={inputClass} style={{ fontSize: '16px', height: '48px' }}>
              {BIZ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#5a4a3a] mb-2" style={{ fontSize: '16px' }}>과세유형</label>
            <div className="grid grid-cols-2 gap-2">
              {(['general', 'simplified'] as const).map((t) => (
                <button key={t} onClick={() => setTaxType(t)}
                  className={`rounded-lg font-semibold transition-all ${taxType === t ? 'bg-[#2D5A8E] text-white' : 'bg-[#F5F0E8] text-[#5a4a3a]'}`}
                  style={{ fontSize: '16px', height: '48px' }}>
                  {t === 'general' ? '일반과세자' : '간이과세자'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '14px' }}>직원 수</label>
              <input type="number" value={empCount} onChange={(e) => setEmpCount(Number(e.target.value))}
                className={`${inputClass} text-right`} style={{ fontSize: '16px', height: '48px' }} />
            </div>
            <div>
              <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '14px' }}>월 근무일</label>
              <input type="number" value={workDays} onChange={(e) => setWorkDays(Number(e.target.value))}
                className={`${inputClass} text-right`} style={{ fontSize: '16px', height: '48px' }} />
            </div>
            <div>
              <label className="block font-semibold text-[#5a4a3a] mb-1" style={{ fontSize: '14px' }}>일 근무시간</label>
              <input type="number" value={workHours} onChange={(e) => setWorkHours(Number(e.target.value))}
                className={`${inputClass} text-right`} style={{ fontSize: '16px', height: '48px' }} />
            </div>
          </div>

          <p className="text-[#a09080] text-center" style={{ fontSize: '14px', lineHeight: '1.8' }}>
            비용은 업종 평균({BENCHMARKS[bizType].name})으로 자동 계산돼요.<br />
            매출만 입력하면 나머지는 자동!
          </p>

          <button onClick={handleSave} disabled={loading}
            className="w-full rounded-xl bg-[#2D5A8E] text-white font-bold hover:bg-[#24496f] disabled:opacity-40 transition-colors"
            style={{ fontSize: '18px', height: '56px' }}>
            {loading ? '저장 중...' : '설정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
