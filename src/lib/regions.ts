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
  { code: 'seoul_gangnam', label: '서울 강남/서초/송파' },
  { code: 'seoul_other',   label: '서울 기타' },
  { code: 'gyeonggi',      label: '경기도' },
  { code: 'incheon',       label: '인천' },
  { code: 'busan',         label: '부산' },
  { code: 'daegu',         label: '대구' },
  { code: 'gwangju',       label: '광주' },
  { code: 'daejeon',       label: '대전' },
  { code: 'ulsan',         label: '울산' },
  { code: 'sejong',        label: '세종' },
  { code: 'metro_other',   label: '기타 광역시' },
  { code: 'gyeongbuk',     label: '경북 (구미/포항 등)' },
  { code: 'cheongdo',      label: '경북 군·읍 (청도/영천 등)' },
  { code: 'chungcheong',   label: '충청' },
  { code: 'jeolla',        label: '전라' },
  { code: 'gangwon',       label: '강원' },
  { code: 'jeju',          label: '제주' },
] as const;

// 지역 코드 → 라벨
export function getRegionLabel(code: RegionCode): string {
  return REGION_LIST.find(r => r.code === code)?.label || code;
}
