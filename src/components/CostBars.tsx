'use client';

import { fmtPct, fmtKRW } from '@/lib/format';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { RegionCode, REGION_COST_ADJUST, getRegionLabel } from '@/lib/regions';

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
  region?: RegionCode;
}

const LABELS = [
  { key: 'rent', label: '\uC784\uB300\uB8CC', color: 'bg-blue-800' },
  { key: 'labor', label: '\uC778\uAC74\uBE44', color: 'bg-amber-500' },
  { key: 'material', label: '\uC7AC\uB8CC/\uB9E4\uC785', color: 'bg-emerald-600' },
  { key: 'other', label: '\uAE30\uD0C0\uACBD\uBE44', color: 'bg-purple-500' },
] as const;

export default function CostBars(props: Props) {
  const bm = BENCHMARKS[props.bizType];
  const adj = props.region ? REGION_COST_ADJUST[props.region] : null;
  const adjustedBm = {
    rent:     bm.rent     + (adj?.rent     ?? 0),
    labor:    bm.labor    + (adj?.labor    ?? 0),
    material: bm.material + (adj?.material ?? 0),
    other:    bm.other,
  };

  const pcts = { rent: props.rentPct, labor: props.laborPct, material: props.materialPct, other: props.otherPct };
  const costs = { rent: props.costRent, labor: props.costLabor, material: props.costMaterial, other: props.costOther };
  const bmVals = { rent: adjustedBm.rent, labor: adjustedBm.labor, material: adjustedBm.material, other: adjustedBm.other };

  const regionLabel = props.region ? getRegionLabel(props.region) : null;
  const avgPrefix = regionLabel ? `${regionLabel} \uD3C9\uADE0` : '\uD3C9\uADE0';

  return (
    <div className="rounded-2xl p-5 shadow-sm border border-border" style={{ background: 'var(--bg-card)' }}>
      <h3 className="font-bold mb-1" style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)', color: 'var(--text-primary)' }}>
        {"\uD83D\uDCCA"} \uC6D0\uAC00 \uAD6C\uC870 \uBD84\uC11D
      </h3>
      {regionLabel && (
        <p className="mb-3" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>
          {regionLabel} \uAE30\uC900 \uBCA4\uCE58\uB9C8\uD06C \uC801\uC6A9
        </p>
      )}
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
                    {avgPrefix} {fmtPct(avg)}
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
