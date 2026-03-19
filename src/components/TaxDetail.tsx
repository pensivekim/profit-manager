'use client';

import { fmtComma } from '@/lib/format';

interface Props {
  vatProvision: number;
  monthlyIncomeTax: number;
  insuranceCost: number;
  totalTax: number;
  taxType: string;
}

export default function TaxDetail({ vatProvision, monthlyIncomeTax, insuranceCost, totalTax, taxType }: Props) {
  const rows = [
    {
      label: `부가세 적립금`,
      sub: taxType === 'general' ? '일반과세 (매출의 10%/6개월)' : '간이과세 (업종률 적용)',
      amount: vatProvision,
    },
    {
      label: '종합소득세 (월할)',
      sub: '연간 추정 후 12등분',
      amount: monthlyIncomeTax,
    },
    {
      label: '4대보험 사업주 부담',
      sub: '직원급여의 약 10.9%',
      amount: insuranceCost,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">세금/보험 내역</h3>
      <div className="divide-y divide-gray-100">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">{r.label}</p>
              <p className="text-xs text-gray-400">{r.sub}</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {fmtComma(r.amount)}원
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t-2 border-gray-200 flex justify-between">
        <span className="font-bold text-gray-800">월 합계</span>
        <span className="font-bold text-red-600">{fmtComma(totalTax)}원</span>
      </div>
    </div>
  );
}
