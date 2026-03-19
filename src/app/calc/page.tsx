'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { fmtComma } from '@/lib/format';
import ResultSummary from '@/components/ResultSummary';
import CostBars from '@/components/CostBars';
import TaxDetail from '@/components/TaxDetail';
import ProCards from '@/components/ProCards';
import AIAdvice from '@/components/AIAdvice';
import TabNav from '@/components/TabNav';
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
  [key: string]: number;
}

export default function CalcPage() {
  const [bizType, setBizType] = useState<BizType>('restaurant');
  const [taxType, setTaxType] = useState<'general' | 'simplified'>('general');
  const [revenue, setRevenue] = useState(20000000);
  const [costRent, setCostRent] = useState(0);
  const [costLabor, setCostLabor] = useState(0);
  const [costMaterial, setCostMaterial] = useState(0);
  const [costOther, setCostOther] = useState(0);
  const [empCount, setEmpCount] = useState(1);
  const [workDays, setWorkDays] = useState(25);
  const [workHours, setWorkHours] = useState(10);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [consultModal, setConsultModal] = useState<{ proType: string; proLabel: string } | null>(null);

  useEffect(() => {
    const bm = BENCHMARKS[bizType];
    setCostRent(Math.round(revenue * bm.rent / 100));
    setCostLabor(Math.round(revenue * bm.labor / 100));
    setCostMaterial(Math.round(revenue * bm.material / 100));
    setCostOther(Math.round(revenue * bm.other / 100));
  }, [bizType, revenue]);

  const handleCalc = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bizType, taxType, revenue,
          costRent, costLabor, costMaterial, costOther,
          empCount, workDays, workHours,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setResult(data);
      setActiveTab('overview');
    } catch {
      alert('서버 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const numInput = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    suffix = '원',
    step = 100000,
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-right text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          {suffix}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">{fmtComma(value)}원</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-sm text-blue-600 font-medium">{"\u2190"} 홈</Link>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-900">내 손에 얼마 남았나?</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">업종</label>
            <select
              value={bizType}
              onChange={(e) => setBizType(e.target.value as BizType)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              {BIZ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">과세유형</label>
            <div className="grid grid-cols-2 gap-2">
              {(['general', 'simplified'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTaxType(t)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    taxType === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t === 'general' ? '일반과세자' : '간이과세자'}
                </button>
              ))}
            </div>
          </div>

          {numInput('월 매출', revenue, setRevenue)}

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">월 지출 (원가)</p>
            <div className="grid grid-cols-2 gap-3">
              {numInput('임대료', costRent, setCostRent)}
              {numInput('인건비', costLabor, setCostLabor)}
              {numInput('재료/매입', costMaterial, setCostMaterial)}
              {numInput('기타경비', costOther, setCostOther)}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-3">
              {numInput('직원 수', empCount, setEmpCount, '명', 1)}
              {numInput('월 근무일', workDays, setWorkDays, '일', 1)}
              {numInput('일 근무시간', workHours, setWorkHours, '시간', 1)}
            </div>
          </div>

          <button
            onClick={handleCalc}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '계산 중...' : '계산하기'}
          </button>
        </div>

        {/* Results with Tabs */}
        {result && (
          <>
            <div className="mt-6">
              <ResultSummary
                finalProfit={result.finalProfit}
                hourlyWage={result.hourlyWage}
                totalHours={result.totalHours}
                revenue={revenue}
              />
            </div>

            <div className="mt-4">
              <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="mt-4 sm:mt-0">
              {activeTab === 'overview' && (
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
                />
              )}

              {activeTab === 'tax' && (
                <TaxDetail
                  vatProvision={result.vatProvision}
                  monthlyIncomeTax={result.monthlyIncomeTax}
                  insuranceCost={result.insuranceCost}
                  totalTax={result.totalTax}
                  taxType={taxType}
                />
              )}

              {activeTab === 'ai' && adviceCalcResult && (
                <AIAdvice
                  calcResult={adviceCalcResult}
                  bizType={bizType}
                  taxType={taxType}
                  revenue={revenue}
                  empCount={empCount}
                  autoFetch={activeTab === 'ai'}
                  onProLink={setActiveTab}
                />
              )}

              {activeTab === 'pro' && (
                <ProCards
                  monthlyIncomeTax={result.monthlyIncomeTax}
                  empCount={empCount}
                  finalProfit={result.finalProfit}
                  onConsult={(proType, proLabel) => setConsultModal({ proType, proLabel })}
                />
              )}
            </div>
          </>
        )}

        {/* History Link */}
        {result && (
          <div className="mt-4 text-center">
            <a
              href="/history"
              className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
            >
              {"\uD83D\uDCCA"} 월별 내역 보기 {"\u2192"}
            </a>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8 pb-4">
          본 계산기는 참고용이며, 정확한 세무 상담은 전문가에게 문의하세요.
        </p>
      </div>

      {/* Consult Modal */}
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
