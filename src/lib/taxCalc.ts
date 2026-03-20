import { TAX_BRACKETS, BENCHMARKS, BizType } from './benchmarks';
import { RegionCode, REGION_COST_ADJUST, REGION_RENT_DANGER } from './regions';

export function calcIncomeTax(annualProfit: number): number {
  for (const b of TAX_BRACKETS) {
    if (annualProfit <= b.limit) {
      return Math.max(0, annualProfit * b.rate - b.deduction);
    }
  }
  return 0;
}

export function calcAll(params: {
  bizType: BizType;
  taxType: 'general' | 'simplified';
  revenue: number;
  costRent: number;
  costLabor: number;
  costMaterial: number;
  costOther: number;
  empCount: number;
  workDays: number;
  workHours: number;
  region?: RegionCode;
}) {
  const bm = BENCHMARKS[params.bizType];
  const opCost = params.costRent + params.costLabor + params.costMaterial + params.costOther;
  const opProfit = params.revenue - opCost;

  const vatProvision = params.taxType === 'general'
    ? Math.round(params.revenue * 0.1 / 6)
    : Math.round(params.revenue * bm.vatRate / 12);

  const empWage = params.empCount > 0
    ? Math.round(params.costLabor / (params.empCount + 1) * params.empCount)
    : 0;
  const insuranceCost = Math.round(empWage * 0.109);

  const annualProfit = opProfit * 12;
  const monthlyIncomeTax = Math.round(calcIncomeTax(annualProfit) / 12);

  const totalTax = vatProvision + insuranceCost + monthlyIncomeTax;
  const finalProfit = opProfit - totalTax;
  const totalHours = params.workDays * params.workHours;
  const hourlyWage = totalHours > 0 ? Math.round(finalProfit / totalHours) : 0;

  const rentPct = Math.round(params.costRent / params.revenue * 100);
  const laborPct = Math.round(params.costLabor / params.revenue * 100);
  const materialPct = Math.round(params.costMaterial / params.revenue * 100);
  const otherPct = Math.round(params.costOther / params.revenue * 100);

  // 지역 보정된 벤치마크
  const adj = params.region ? REGION_COST_ADJUST[params.region] : null;
  const adjustedBm = {
    rent:     bm.rent     + (adj?.rent     ?? 0),
    labor:    bm.labor    + (adj?.labor    ?? 0),
    material: bm.material + (adj?.material ?? 0),
    other:    bm.other,
  };

  // 임대료 위험 기준
  const rentDangerThreshold = params.region
    ? REGION_RENT_DANGER[params.region]
    : 20;

  return {
    opCost, opProfit, vatProvision, empWage,
    insuranceCost, monthlyIncomeTax, totalTax,
    finalProfit, totalHours, hourlyWage,
    rentPct, laborPct, materialPct, otherPct,
    adjustedBm,
    rentDangerThreshold,
    isRentDanger: rentPct > rentDangerThreshold,
  };
}
