export type RegionCode =
  | 'seoul_gangnam'
  | 'seoul_other'
  | 'gyeonggi'
  | 'incheon'
  | 'busan'
  | 'daegu'
  | 'gwangju'
  | 'daejeon'
  | 'ulsan'
  | 'sejong'
  | 'metro_other'
  | 'gyeongbuk'
  | 'cheongdo'
  | 'chungcheong'
  | 'jeolla'
  | 'gangwon'
  | 'jeju';

// 지역별 임대료 위험 기준 (매출 대비 %)
export const REGION_RENT_DANGER: Record<RegionCode, number> = {
  seoul_gangnam: 25,
  seoul_other:   20,
  gyeonggi:      18,
  incheon:       17,
  busan:         16,
  daegu:         14,
  gwangju:       13,
  daejeon:       13,
  ulsan:         13,
  sejong:        12,
  metro_other:   13,
  gyeongbuk:     11,
  cheongdo:       9,
  chungcheong:   11,
  jeolla:        10,
  gangwon:       10,
  jeju:          15,
};

// 지역별 업종 원가율 보정값 (전국 기준 대비 %p)
export const REGION_COST_ADJUST: Record<RegionCode, {
  rent: number; labor: number; material: number; delivery: number;
}> = {
  seoul_gangnam: { rent: +8,  labor: +3,  material: +2,  delivery: +2 },
  seoul_other:   { rent: +4,  labor: +2,  material: +1,  delivery: +1 },
  gyeonggi:      { rent: +2,  labor: +1,  material: 0,   delivery: +1 },
  incheon:       { rent: +1,  labor: +1,  material: 0,   delivery: 0  },
  busan:         { rent: 0,   labor: 0,   material: 0,   delivery: 0  },
  daegu:         { rent: -1,  labor: -1,  material: -1,  delivery: -1 },
  gwangju:       { rent: -1,  labor: -1,  material: -1,  delivery: -1 },
  daejeon:       { rent: -1,  labor: -1,  material: -1,  delivery: -1 },
  ulsan:         { rent: 0,   labor: +1,  material: 0,   delivery: -1 },
  sejong:        { rent: -1,  labor: 0,   material: -1,  delivery: -1 },
  metro_other:   { rent: -1,  labor: -1,  material: -1,  delivery: -1 },
  gyeongbuk:     { rent: -3,  labor: -2,  material: -2,  delivery: -2 },
  cheongdo:      { rent: -5,  labor: -3,  material: -2,  delivery: -3 },
  chungcheong:   { rent: -2,  labor: -2,  material: -1,  delivery: -2 },
  jeolla:        { rent: -3,  labor: -2,  material: -1,  delivery: -2 },
  gangwon:       { rent: -3,  labor: -2,  material: -1,  delivery: -2 },
  jeju:          { rent: +2,  labor: 0,   material: +2,  delivery: +1 },
};

// 지역 선택 UI용 목록
export const REGION_LIST: readonly { code: RegionCode; label: string }[] = [
  { code: 'seoul_gangnam', label: '\uC11C\uC6B8 \uAC15\uB0A8/\uC11C\uCD08/\uC1A1\uD30C' },
  { code: 'seoul_other',   label: '\uC11C\uC6B8 \uAE30\uD0C0' },
  { code: 'gyeonggi',      label: '\uACBD\uAE30\uB3C4' },
  { code: 'incheon',       label: '\uC778\uCC9C' },
  { code: 'busan',         label: '\uBD80\uC0B0' },
  { code: 'daegu',         label: '\uB300\uAD6C' },
  { code: 'gwangju',       label: '\uAD11\uC8FC' },
  { code: 'daejeon',       label: '\uB300\uC804' },
  { code: 'ulsan',         label: '\uC6B8\uC0B0' },
  { code: 'sejong',        label: '\uC138\uC885' },
  { code: 'metro_other',   label: '\uAE30\uD0C0 \uAD11\uC5ED\uC2DC' },
  { code: 'gyeongbuk',     label: '\uACBD\uBD81 (\uAD6C\uBBF8/\uD3EC\uD56D \uB4F1)' },
  { code: 'cheongdo',      label: '\uACBD\uBD81 \uAD70\xB7\uC74D (\uCCAD\uB3C4/\uC601\uCC9C \uB4F1)' },
  { code: 'chungcheong',   label: '\uCDA9\uCCAD' },
  { code: 'jeolla',        label: '\uC804\uB77C' },
  { code: 'gangwon',       label: '\uAC15\uC6D0' },
  { code: 'jeju',          label: '\uC81C\uC8FC' },
] as const;

// 지역 코드 → 라벨
export function getRegionLabel(code: RegionCode): string {
  return REGION_LIST.find(r => r.code === code)?.label || code;
}
