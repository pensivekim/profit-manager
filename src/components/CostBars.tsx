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
  { key: 'rent', label: '임대료', color: 'bg-blue-800' },
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
    <div className="rounded-2xl p-5 shadow-sm border border-border" style={{ background: 'var(--bg-card)' }}>
      <h3 className="font-bold mb-4" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
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
              <div className="flex justify-between mb-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="flex items-center gap-2">
                  <span className={`font-bold ${over ? 'text-red-600' : ''}`} style={{ color: over ? undefined : 'var(--text-primary)' }}>
                    {fmtPct(pct)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-hint)' }}>
                    평균 {fmtPct(avg)}
                    {over && ` (+${diff}%)`}
                  </span>
                </span>
              </div>
              <div className="relative h-7 rounded-full overflow-hidden" style={{ background: 'var(--bg-page)' }}>
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${over ? 'bg-red-400' : color}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
                {avg > 0 && (
                  <div
                    className="absolute inset-y-0 border-r-2 border-dashed"
                    style={{ left: `${Math.min(avg, 100)}%`, borderColor: 'var(--text-hint)' }}
                  />
                )}
              </div>
              <p className="text-sm mt-1 text-right" style={{ color: 'var(--text-hint)' }}>{fmtKRW(costs[key])}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
