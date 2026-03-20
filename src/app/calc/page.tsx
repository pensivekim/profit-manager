'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { fmtComma, fmtKRW } from '@/lib/format';
import { RegionCode, REGION_LIST, REGION_COST_ADJUST, getRegionLabel } from '@/lib/regions';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import ResultSummary from '@/components/ResultSummary';
import CostBars from '@/components/CostBars';
import TaxDetail from '@/components/TaxDetail';
import ProCards from '@/components/ProCards';
import AIAdvice from '@/components/AIAdvice';
import ConsultModal from '@/components/ConsultModal';

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

interface CalcResult {
  opCost: number;
  opProfit: number;
  vatProvision: number;
  empWage: number;
  insuranceCost: number;
  monthlyIncomeTax: number;
  totalTax: number;
  finalProfit: number;
  totalHours: number;
  hourlyWage: number;
  rentPct: number;
  laborPct: number;
  materialPct: number;
  otherPct: number;
  adjustedBm: { rent: number; labor: number; material: number; other: number };
  rentDangerThreshold: number;
  isRentDanger: boolean;
  [key: string]: number | boolean | { rent: number; labor: number; material: number; other: number };
}

function calcDefaults(biz: BizType, rev: number, region?: RegionCode) {
  const bm = BENCHMARKS[biz];
  const adj = region ? REGION_COST_ADJUST[region] : null;
  return {
    costRent: Math.round(rev * (bm.rent + (adj?.rent ?? 0)) / 100),
    costLabor: Math.round(rev * (bm.labor + (adj?.labor ?? 0)) / 100),
    costMaterial: Math.round(rev * (bm.material + (adj?.material ?? 0)) / 100),
    costOther: Math.round(rev * bm.other / 100),
  };
}

const initBiz: BizType = 'restaurant';
const initRev = 20000000;
const initRegion: RegionCode = 'daegu';
const initDefaults = calcDefaults(initBiz, initRev, initRegion);

export default function CalcPage() {
  const [bizType, setBizType] = useState<BizType>(initBiz);
  const [taxType, setTaxType] = useState<'general' | 'simplified'>('general');
  const [revenue, setRevenue] = useState(initRev);
  const [costRent, setCostRent] = useState(initDefaults.costRent);
  const [costLabor, setCostLabor] = useState(initDefaults.costLabor);
  const [costMaterial, setCostMaterial] = useState(initDefaults.costMaterial);
  const [costOther, setCostOther] = useState(initDefaults.costOther);
  const [empCount, setEmpCount] = useState(1);
  const [workDays, setWorkDays] = useState(25);
  const [workHours, setWorkHours] = useState(10);
  const [region, setRegion] = useState<RegionCode>(initRegion);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [consultModal, setConsultModal] = useState<{ proType: string; proLabel: string } | null>(null);
  const { user } = useAuth();

  // 포커스 상태 추적 (콤마 포맷용)
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const bm = BENCHMARKS[bizType];

  const applyDefaults = useCallback((biz: BizType, rev: number, reg?: RegionCode) => {
    const d = calcDefaults(biz, rev, reg);
    setCostRent(d.costRent);
    setCostLabor(d.costLabor);
    setCostMaterial(d.costMaterial);
    setCostOther(d.costOther);
  }, []);

  const handleBizChange = (newBiz: BizType) => {
    setBizType(newBiz);
    applyDefaults(newBiz, revenue, region);
  };

  const handleRevenueChange = (newRev: number) => {
    setRevenue(newRev);
    applyDefaults(bizType, newRev, region);
  };

  const handleRegionChange = (newRegion: RegionCode) => {
    setRegion(newRegion);
    applyDefaults(bizType, revenue, newRegion);
  };

  const handleCalc = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bizType, taxType, revenue,
          costRent, costLabor, costMaterial, costOther,
          empCount, workDays, workHours, region,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setResult(data);
      setShowAI(false);
    } catch {
      alert('서버 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 금액 입력 (포커스: 숫자만, 블러: 콤마 포맷)
  const moneyInput = (
    fieldId: string,
    label: string,
    value: number,
    onChange: (v: number) => void,
    avgPct?: number,
  ) => {
    const isFocused = focusedField === fieldId;
    const actualPct = avgPct !== undefined && revenue > 0 ? Math.round(value / revenue * 100) : null;
    const over = actualPct !== null && avgPct !== undefined && actualPct > avgPct && avgPct > 0;

    return (
      <div>
        <label className="block text-base font-semibold mb-1" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>
          {label}
          {avgPct !== undefined && (
            <span className={`ml-1 text-sm font-normal ${over ? 'text-red-600' : ''}`} style={{ color: over ? undefined : 'var(--text-hint)' }}>
              (평균 {avgPct}%)
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type={isFocused ? 'number' : 'text'}
            inputMode="numeric"
            value={isFocused ? value : fmtComma(value)}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9-]/g, '');
              onChange(Number(raw) || 0);
            }}
            onFocus={() => setFocusedField(fieldId)}
            onBlur={() => setFocusedField(null)}
            step={100000}
            className="w-full rounded-lg border border-border px-4 py-3 text-right text-base outline-none"
            style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {actualPct !== null ? (
            <span className={`text-sm ${over ? 'text-red-600 font-semibold' : ''}`} style={{ color: over ? undefined : 'var(--text-hint)' }}>
              {actualPct}%{over && ' (초과!)'}
            </span>
          ) : (
            <span />
          )}
          <span className="text-sm" style={{ color: 'var(--text-hint)' }}>{fmtKRW(value)}</span>
        </div>
      </div>
    );
  };

  const numInput = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    suffix: string,
    step: number,
  ) => (
    <div>
      <label className="block text-base font-semibold mb-1" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          className="w-full rounded-lg border border-border px-4 py-3 text-right text-base outline-none"
          style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'var(--text-hint)' }}>{suffix}</span>
      </div>
    </div>
  );

  const adviceCalcResult = result ? {
    ...result,
    costRent,
    costLabor,
    costMaterial,
    costOther,
  } : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Header />
      <div className="max-w-lg mx-auto px-4 pb-24 sm:pb-8">
        <h1 className="text-xl font-bold text-center mb-5" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>내 손에 얼마 남았나?</h1>

        {/* Input Form */}
        <div className="rounded-2xl p-6 shadow-sm border border-border space-y-5" style={{ background: 'var(--bg-card)' }}>
          {/* 업종 */}
          <div>
            <label className="block text-base font-semibold mb-1" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>업종</label>
            <select
              value={bizType}
              onChange={(e) => handleBizChange(e.target.value as BizType)}
              className="w-full rounded-lg border border-border px-4 py-3 text-base outline-none"
              style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              {BIZ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-base font-semibold mb-1" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>{"\uD83D\uDCCD"} 사업장 지역</label>
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value as RegionCode)}
              className="w-full rounded-lg border border-border px-4 py-3 text-base outline-none"
              style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              {REGION_LIST.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* 과세유형 */}
          <div>
            <label className="block text-base font-semibold mb-2" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-secondary)' }}>과세유형</label>
            <div className="grid grid-cols-2 gap-2">
              {(['general', 'simplified'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTaxType(t)}
                  className="py-3 rounded-lg text-base font-semibold transition-all"
                  style={taxType === t
                    ? { lineHeight: 'var(--line-height)', background: 'var(--accent)', color: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                    : { lineHeight: 'var(--line-height)', background: 'var(--bg-page)', color: 'var(--text-secondary)' }}
                >
                  {t === 'general' ? '일반과세자' : '간이과세자'}
                </button>
              ))}
            </div>
          </div>

          {/* 매출 */}
          {moneyInput('revenue', '월 매출', revenue, handleRevenueChange)}

          {/* 원가 4항목 */}
          <div className="pt-3 border-t border-border">
            <p className="text-base font-bold mb-3" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>월 지출 (원가)</p>
            <div className="grid grid-cols-2 gap-3">
              {moneyInput('rent', '임대료', costRent, setCostRent, bm.rent)}
              {moneyInput('labor', '인건비', costLabor, setCostLabor, bm.labor)}
              {moneyInput('material', '재료/매입', costMaterial, setCostMaterial, bm.material)}
              {moneyInput('other', '기타경비', costOther, setCostOther, bm.other)}
            </div>
          </div>

          {/* 직원/근무 */}
          <div className="pt-3 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              {numInput('직원 수', empCount, setEmpCount, '명', 1)}
              {numInput('월 근무일', workDays, setWorkDays, '일', 1)}
              {numInput('일 근무시간', workHours, setWorkHours, '시간', 1)}
            </div>
          </div>

          {/* 계산 버튼 */}
          <button
            onClick={handleCalc}
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-bold text-lg hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height)', background: 'var(--accent)' }}
          >
            {loading ? '계산 중...' : '계산하기'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            <ResultSummary
              finalProfit={result.finalProfit}
              hourlyWage={result.hourlyWage}
              totalHours={result.totalHours}
              revenue={revenue}
              opCost={result.opCost}
              totalTax={result.totalTax}
            />
            <TaxDetail
              vatProvision={result.vatProvision}
              monthlyIncomeTax={result.monthlyIncomeTax}
              insuranceCost={result.insuranceCost}
              totalTax={result.totalTax}
              taxType={taxType}
              empCount={empCount}
            />
            {result.isRentDanger && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="font-bold text-red-600" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)' }}>
                  {"\uD83D\uDEA8"} 임대료가 {getRegionLabel(region)} 기준 평균보다 {result.rentPct - result.rentDangerThreshold}%p 높습니다
                </p>
                <p className="text-red-500 mt-1" style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)' }}>
                  {getRegionLabel(region)} 위험 기준: 매출의 {result.rentDangerThreshold}% | 현재: {result.rentPct}%
                </p>
              </div>
            )}

            <CostBars
              bizType={bizType}
              rentPct={result.rentPct}
              laborPct={result.laborPct}
              materialPct={result.materialPct}
              otherPct={result.otherPct}
              costRent={costRent}
              costLabor={costLabor}
              costMaterial={costMaterial}
              costOther={costOther}
              region={region}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAI(true)}
                className="py-4 rounded-xl font-bold text-white text-base transition-colors"
                style={{ background: 'var(--accent)', minHeight: '48px', lineHeight: 'var(--line-height)' }}
              >
                {"\uD83E\uDD16"} AI 경영 조언
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('pro-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-4 rounded-xl font-bold text-base border-2 transition-colors"
                style={{ minHeight: '48px', lineHeight: 'var(--line-height)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                {"\uD83D\uDC64"} 전문가 연결
              </button>
            </div>

            {showAI && adviceCalcResult && (
              <AIAdvice
                calcResult={adviceCalcResult}
                bizType={bizType}
                taxType={taxType}
                revenue={revenue}
                empCount={empCount}
                region={region}
                autoFetch={showAI}
                onProLink={() => {
                  const el = document.getElementById('pro-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            <div id="pro-section">
              <ProCards
                monthlyIncomeTax={result.monthlyIncomeTax}
                vatProvision={result.vatProvision}
                empCount={empCount}
                insuranceCost={result.insuranceCost}
                finalProfit={result.finalProfit}
                rentPct={result.rentPct}
                onConsult={(proType, proLabel) => setConsultModal({ proType, proLabel })}
              />
            </div>

            {/* 로그인 유도 */}
            {!user && (
              <Link href="/login"
                className="block rounded-xl p-4 text-center border-2 border-dashed"
                style={{ borderColor: 'var(--accent)', background: 'var(--accent-light)' }}>
                <p className="font-bold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--accent)' }}>
                  {"\uD83D\uDD12"} 기록을 저장하려면 로그인하세요
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-hint)', marginTop: '4px' }}>
                  전화번호만으로 10초 가입
                </p>
              </Link>
            )}

            <div className="text-center">
              <Link href="/history" className="inline-flex items-center gap-1 text-base font-semibold hover:underline" style={{ minHeight: '48px', lineHeight: 'var(--line-height)', color: 'var(--accent)' }}>
                {"\uD83D\uDCCA"} 주별 내역 보기 {"\u2192"}
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-sm mt-8 pb-4" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-hint)' }}>
          본 계산기는 참고용이며, 정확한 세무 상담은 전문가에게 문의하세요.
        </p>
      </div>

      {consultModal && (
        <ConsultModal
          proType={consultModal.proType}
          proLabel={consultModal.proLabel}
          recordSnapshot={result ? { ...result, revenue, bizType, taxType } : undefined}
          onClose={() => setConsultModal(null)}
        />
      )}
    </div>
  );
}
