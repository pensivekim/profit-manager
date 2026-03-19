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
  { key: 'rent', label: '임대료', color: 'bg-blue-500' },
  { key: 'labor', label: '인건비', color: 'bg-amber-500' },
  { key: 'material', label: '재료/매입', color: 'bg-emerald-500' },
  { key: 'other', label: '기타경비', color: 'bg-purple-500' },
] as const;

export default function CostBars(props: Props) {
  const bm = BENCHMARKS[props.bizType];
  const pcts = { rent: props.rentPct, labor: props.laborPct, material: props.materialPct, other: props.otherPct };
  const costs = { rent: props.costRent, labor: props.costLabor, material: props.costMaterial, other: props.costOther };
  const bmVals = { rent: bm.rent, labor: bm.labor, material: bm.material, other: bm.other };

  return (
    <div className="rounded-2xl p-6 shadow-sm border border-[#e0d5c5]" style={{ background: '#FFFDF7' }}>
      <h3 className="font-bold text-gray-800 mb-4">원가 구조 분석</h3>
      <div className="space-y-4">
        {LABELS.map(({ key, label, color }) => {
          const pct = pcts[key];
          const avg = bmVals[key];
          const over = pct > avg;
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{label}</span>
                <span className="flex items-center gap-2">
                  <span className={`font-semibold ${over ? 'text-red-600' : 'text-gray-800'}`}>
                    {fmtPct(pct)}
                  </span>
                  <span className="text-gray-400 text-xs">
                    (업종평균 {fmtPct(avg)})
                  </span>
                </span>
              </div>
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${over ? 'bg-red-400' : color}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 border-r-2 border-dashed border-gray-400"
                  style={{ left: `${avg}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">{fmtKRW(costs[key])}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
