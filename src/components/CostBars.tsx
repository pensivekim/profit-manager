'use client';

import { fmtPct, fmtKRW } from '@/lib/format';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';

interface Props {
  bizType: BizType;
  rentPct: number;
  laborPct: number;
  materialPct: number;
  otherPct: number;
  costRent: number;
  costLabor: number;
  costMaterial: number;
  costOther: number;
}

const LABELS = [
  { key: 'rent', label: '임대료', color: 'bg-[#2D5A8E]' },
  { key: 'labor', label: '인건비', color: 'bg-amber-500' },
  { key: 'material', label: '재료/매입', color: 'bg-emerald-600' },
  { key: 'other', label: '기타경비', color: 'bg-purple-500' },
] as const;

export default function CostBars(props: Props) {
  const bm = BENCHMARKS[props.bizType];
  const pcts = { rent: props.rentPct, labor: props.laborPct, material: props.materialPct, other: props.otherPct };
  const costs = { rent: props.costRent, labor: props.costLabor, material: props.costMaterial, other: props.costOther };
  const bmVals = { rent: bm.rent, labor: bm.labor, material: bm.material, other: bm.other };

  return (
    <div className="rounded-2xl p-5 shadow-sm border border-[#e0d5c5]" style={{ background: '#FFFDF7' }}>
      <h3 className="font-bold text-[#3a3025] mb-4" style={{ fontSize: '16px', lineHeight: '1.8' }}>
        {"\uD83D\uDCCA"} 원가 구조 분석
      </h3>
      <div className="space-y-4">
        {LABELS.map(({ key, label, color }) => {
          const pct = pcts[key];
          const avg = bmVals[key];
          const over = pct > avg && avg > 0;
          const diff = pct - avg;
          return (
            <div key={key}>
              <div className="flex justify-between mb-1" style={{ fontSize: '16px', lineHeight: '1.8' }}>
                <span className="font-semibold text-[#5a4a3a]">{label}</span>
                <span className="flex items-center gap-2">
                  <span className={`font-bold ${over ? 'text-red-600' : 'text-[#3a3025]'}`}>
                    {fmtPct(pct)}
                  </span>
                  <span className="text-[#a09080] text-sm">
                    평균 {fmtPct(avg)}
                    {over && ` (+${diff}%)`}
                  </span>
                </span>
              </div>
              <div className="relative h-7 rounded-full overflow-hidden" style={{ background: '#F5F0E8' }}>
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${over ? 'bg-red-400' : color}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
                {avg > 0 && (
                  <div
                    className="absolute inset-y-0 border-r-2 border-dashed border-[#a09080]"
                    style={{ left: `${Math.min(avg, 100)}%` }}
                  />
                )}
              </div>
              <p className="text-sm text-[#a09080] mt-1 text-right">{fmtKRW(costs[key])}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
