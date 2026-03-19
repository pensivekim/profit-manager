// 입력창 표시용 — 천단위 콤마
export function fmtComma(n: number): string {
  return n.toLocaleString('ko-KR');
}

// 결과 표시용 — 만원 단위 변환
export function fmtKRW(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 100000000) return sign + (abs / 100000000).toFixed(1) + '억원';
  if (abs >= 10000000) return sign + (abs / 10000000).toFixed(1) + '천만원';
  if (abs >= 10000) return sign + fmtComma(Math.round(abs / 10000)) + '만원';
  return sign + fmtComma(abs) + '원';
}

export function fmtPct(n: number): string {
  return `${n}%`;
}
