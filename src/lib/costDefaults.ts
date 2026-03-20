import { BENCHMARKS, BizType, MIN_WAGE_MONTHLY } from './benchmarks';
import { RegionCode, REGION_COST_ADJUST } from './regions';

/**
 * 업종+지역+직원수 기반 기본 비용 계산
 * 직원 수에 따라 인건비 하한선(최저임금) 적용
 */
export function calcCostDefaults(
  biz: BizType,
  revenue: number,
  empCount: number,
  region?: RegionCode,
) {
  const bm = BENCHMARKS[biz];
  const adj = region ? REGION_COST_ADJUST[region] : null;

  const costRent = Math.round(revenue * (bm.rent + (adj?.rent ?? 0)) / 100);
  const costMaterial = Math.round(revenue * (bm.material + (adj?.material ?? 0)) / 100);
  const costOther = Math.round(revenue * bm.other / 100);

  // 인건비: 업종 평균 vs 최저임금×직원수 중 큰 값
  const laborByAvg = Math.round(revenue * (bm.labor + (adj?.labor ?? 0)) / 100);
  const laborByMinWage = empCount * MIN_WAGE_MONTHLY;
  const costLabor = Math.max(laborByAvg, laborByMinWage);

  return { costRent, costLabor, costMaterial, costOther };
}
