'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { RegionCode, REGION_LIST, REGION_COST_ADJUST } from '@/lib/regions';
import { fmtComma, fmtKRW } from '@/lib/format';

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

function calcCostDefaults(biz: BizType, region: RegionCode, revenue: number) {
  const bm = BENCHMARKS[biz];
  const adj = REGION_COST_ADJUST[region];
  return {
    costRent: Math.round(revenue * (bm.rent + (adj?.rent ?? 0)) / 100),
    costLabor: Math.round(revenue * (bm.labor + (adj?.labor ?? 0)) / 100),
    costMaterial: Math.round(revenue * (bm.material + (adj?.material ?? 0)) / 100),
    costOther: Math.round(revenue * bm.other / 100),
  };
}

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bizType, setBizType] = useState<BizType>('restaurant');
  const [region, setRegion] = useState<RegionCode>('daegu');
  const [taxType, setTaxType] = useState<'general' | 'simplified'>('general');
  const [empCount, setEmpCount] = useState(0);
  const [workDays, setWorkDays] = useState(25);
  const [workHours, setWorkHours] = useState(10);
  const [avgRevenue, setAvgRevenue] = useState(20000000);
  const [costRent, setCostRent] = useState(0);
  const [costLabor, setCostLabor] = useState(0);
  const [costMaterial, setCostMaterial] = useState(0);
  const [costOther, setCostOther] = useState(0);
  const [useCustomCost, setUseCustomCost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingUserId, setExistingUserId] = useState('');
  const [isKakaoUser, setIsKakaoUser] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 업종/지역 변경 시 비용 기본값 재계산
  const applyDefaults = useCallback((biz: BizType, reg: RegionCode, rev: number) => {
    if (!useCustomCost) {
      const d = calcCostDefaults(biz, reg, rev);
      setCostRent(d.costRent);
      setCostLabor(d.costLabor);
      setCostMaterial(d.costMaterial);
      setCostOther(d.costOther);
    }
  }, [useCustomCost]);

  useEffect(() => {
    const d = calcCostDefaults(bizType, region, avgRevenue);
    setCostRent(d.costRent);
    setCostLabor(d.costLabor);
    setCostMaterial(d.costMaterial);
    setCostOther(d.costOther);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem('pro_user_id');
    if (savedId) {
      setExistingUserId(savedId);
      setIsKakaoUser(savedId.startsWith('kakao-'));
      fetch(`/api/settings?userId=${savedId}`).then(r => r.json()).then(data => {
        if (data.user) {
          setName(data.user.name || data.user.nickname || '');
          setPhone(data.user.phone || '');
          setBizType(data.user.biz_type || 'restaurant');
          setRegion(data.user.region || 'daegu');
          setTaxType(data.user.tax_type || 'general');
          setEmpCount(data.user.emp_count || 0);
          setWorkDays(data.user.work_days || 25);
          setWorkHours(data.user.work_hours || 10);
          if (data.user.cost_rent || data.user.cost_labor || data.user.cost_material || data.user.cost_other) {
            setCostRent(data.user.cost_rent || 0);
            setCostLabor(data.user.cost_labor || 0);
            setCostMaterial(data.user.cost_material || 0);
            setCostOther(data.user.cost_other || 0);
            setUseCustomCost(true);
          }
        }
      }).catch(() => {});
    }
  }, []);

  const handleBizChange = (newBiz: BizType) => {
    setBizType(newBiz);
    applyDefaults(newBiz, region, avgRevenue);
  };

  const handleRegionChange = (newRegion: RegionCode) => {
    setRegion(newRegion);
    applyDefaults(bizType, newRegion, avgRevenue);
  };

  const handleRevenueChange = (newRev: number) => {
    setAvgRevenue(newRev);
    applyDefaults(bizType, region, newRev);
  };

  const handleSave = useCallback(async () => {
    if (!name.trim()) { alert('이름을 입력해주세요'); return; }
    setLoading(true);
    const normalizedPhone = phone.replace(/-/g, '');
    const userId = existingUserId || `user-${normalizedPhone}`;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, name, phone: normalizedPhone, bizType, region, taxType,
          empCount, workDays, workHours,
          costRent, costLabor, costMaterial, costOther,
        }),
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
  }, [name, phone, bizType, region, taxType, empCount, workDays, workHours, costRent, costLabor, costMaterial, costOther, existingUserId]);

  const inputClass = "w-full rounded-lg border border-border px-4 outline-none";

  const moneyField = (fieldId: string, label: string, value: number, onChange: (v: number) => void, avgPct: number) => {
    const isFocused = focusedField === fieldId;
    return (
      <div>
        <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          {label}
          <span style={{ fontSize: '11px', color: 'var(--text-hint)', marginLeft: '4px', fontWeight: 'normal' }}>
            (평균 {avgPct}%)
          </span>
        </label>
        <input
          type={isFocused ? 'number' : 'text'}
          inputMode="numeric"
          value={isFocused ? value : fmtComma(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9-]/g, '');
            onChange(Number(raw) || 0);
            setUseCustomCost(true);
          }}
          onFocus={() => setFocusedField(fieldId)}
          onBlur={() => setFocusedField(null)}
          className={`${inputClass} text-right`}
          style={{ fontSize: '16px', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        />
        <p className="text-right mt-0.5" style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{fmtKRW(value)}</p>
      </div>
    );
  };

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
          <div className="space-y-3">
            <Link href="/weekly" className="block w-full py-4 rounded-xl text-white font-bold text-center"
              style={{ fontSize: 'var(--font-size-lg)', minHeight: '52px', lineHeight: '2.2', background: 'var(--accent)' }}>
              이번 주 매출 입력하기
            </Link>
            <Link href="/calc" className="block w-full py-4 rounded-xl font-bold text-center border-2"
              style={{ fontSize: 'var(--font-size-base)', minHeight: '52px', lineHeight: '2.2', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              상세 분석 해보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bm = BENCHMARKS[bizType];
  const adj = REGION_COST_ADJUST[region];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="font-bold" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
            기본 설정
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>
            사장님 정보를 입력하면 매주 자동으로 계산해드려요
          </p>
        </div>

        <div className="rounded-2xl p-5 border border-border space-y-4" style={{ background: 'var(--bg-card)' }}>
          {/* 이름 / 전화번호 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                className={inputClass} style={{ fontSize: '16px', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                전화번호{isKakaoUser && <span style={{ fontSize: '11px', color: 'var(--text-hint)', fontWeight: 'normal' }}> (선택)</span>}
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678"
                className={inputClass} style={{ fontSize: '16px', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          {/* 업종 */}
          <div>
            <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>업종</label>
            <select value={bizType} onChange={(e) => handleBizChange(e.target.value as BizType)}
              className={inputClass} style={{ fontSize: '16px', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {BIZ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
              {"\uD83D\uDCCD"} 사업장 지역
              <span style={{ fontSize: '11px', color: '#9A9690', marginLeft: '6px', fontWeight: 'normal' }}>(지역마다 지표가 다르게 계산됩니다)</span>
            </label>
            <select value={region} onChange={(e) => handleRegionChange(e.target.value as RegionCode)}
              className={inputClass} style={{ fontSize: '16px', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {REGION_LIST.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>

          {/* 과세유형 */}
          <div>
            <label className="block font-semibold mb-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>과세유형</label>
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

          {/* 월 평균 매출 */}
          <div className="pt-3 border-t border-border">
            <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>월 평균 매출</label>
            <input
              type={focusedField === 'avgRevenue' ? 'number' : 'text'}
              inputMode="numeric"
              value={focusedField === 'avgRevenue' ? avgRevenue : fmtComma(avgRevenue)}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                handleRevenueChange(Number(raw) || 0);
              }}
              onFocus={() => setFocusedField('avgRevenue')}
              onBlur={() => setFocusedField(null)}
              className={`${inputClass} text-right`}
              style={{ fontSize: '16px', height: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
            <p className="text-right mt-0.5" style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{fmtKRW(avgRevenue)}</p>
          </div>

          {/* 고정 비용 */}
          <div>
            <p className="font-bold mb-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
              월 고정 비용
              <span style={{ fontSize: '11px', color: 'var(--text-hint)', marginLeft: '6px', fontWeight: 'normal' }}>
                업종+지역 평균 자동 입력 / 직접 수정 가능
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {moneyField('rent', '임대료', costRent, setCostRent, bm.rent + (adj?.rent ?? 0))}
              {moneyField('labor', '인건비', costLabor, setCostLabor, bm.labor + (adj?.labor ?? 0))}
              {moneyField('material', '재료/매입', costMaterial, setCostMaterial, bm.material + (adj?.material ?? 0))}
              {moneyField('other', '기타경비', costOther, setCostOther, bm.other)}
            </div>
            {!useCustomCost && (
              <p className="text-center mt-2" style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
                {bm.name} + {REGION_LIST.find(r => r.code === region)?.label} 평균으로 자동 계산됨
              </p>
            )}
          </div>

          {/* 직원/근무 */}
          <div className="pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>직원 수</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={empCount} onChange={(e) => setEmpCount(Number(e.target.value))}
                    className={`${inputClass} flex-1 min-w-0 text-right`} style={{ fontSize: '16px', minHeight: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <span className="text-sm shrink-0" style={{ color: 'var(--text-hint)', width: '28px' }}>명</span>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>월 근무일</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={workDays} onChange={(e) => setWorkDays(Number(e.target.value))}
                    className={`${inputClass} flex-1 min-w-0 text-right`} style={{ fontSize: '16px', minHeight: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <span className="text-sm shrink-0" style={{ color: 'var(--text-hint)', width: '28px' }}>일</span>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>일 근무시간</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={workHours} onChange={(e) => setWorkHours(Number(e.target.value))}
                    className={`${inputClass} flex-1 min-w-0 text-right`} style={{ fontSize: '16px', minHeight: '48px', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  <span className="text-sm shrink-0" style={{ color: 'var(--text-hint)', width: '28px' }}>시간</span>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 */}
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
