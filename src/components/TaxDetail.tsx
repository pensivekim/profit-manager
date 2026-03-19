'use client';

import { useState } from 'react';
import { fmtComma } from '@/lib/format';

interface Props {
  vatProvision: number;
  monthlyIncomeTax: number;
  insuranceCost: number;
  totalTax: number;
  taxType: string;
  empCount: number;
}

export default function TaxDetail({ vatProvision, monthlyIncomeTax, insuranceCost, totalTax, taxType, empCount }: Props) {
  const [open, setOpen] = useState(true);

  const rows = [
    {
      label: '부가세 적립 (월)',
      sub: taxType === 'general'
        ? '일반과세: 매출 x 10% / 6개월'
        : '간이과세: 매출 x 업종별 부가가치율 / 12개월',
      amount: vatProvision,
    },
    {
      label: '종합소득세 (월 예상)',
      sub: '연간 순이익에 구간세율 적용 후 12등분',
      amount: monthlyIncomeTax,
    },
    {
      label: '4대보험 사업주 부담',
      sub: empCount > 0
        ? `직원급여 x 10.9% (국민4.5% + 건강3.5% + 고용0.9% + 산재1.0%)`
        : '직원 0명 - 해당 없음',
      amount: insuranceCost,
    },
  ];

  return (
    <div className="rounded-2xl shadow-sm border border-border overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between"
        style={{ minHeight: '48px', lineHeight: 'var(--line-height)' }}
      >
        <span className="font-bold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
          {"\uD83D\uDCB0"} 세금/보험 내역
        </span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-600" style={{ fontSize: 'var(--font-size-base)' }}>
            월 {fmtComma(totalTax)}원
          </span>
          <span style={{ color: 'var(--text-hint)' }}>{open ? '\u25B2' : '\u25BC'}</span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between items-start py-3" style={{ lineHeight: 'var(--line-height)' }}>
                <div className="flex-1 mr-3">
                  <p className="font-semibold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>{r.label}</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>{r.sub}</p>
                </div>
                <p className="font-bold whitespace-nowrap" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                  {fmtComma(r.amount)}원
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-3 border-t-2 border-border flex justify-between" style={{ lineHeight: 'var(--line-height)' }}>
            <span className="font-bold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>월 세금 합계</span>
            <span className="font-bold text-red-600" style={{ fontSize: 'var(--font-size-lg)' }}>{fmtComma(totalTax)}원</span>
          </div>
        </div>
      )}
    </div>
  );
}
