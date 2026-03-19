export function fmtKRW(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(1)}천만원`;
  if (abs >= 1000000) return `${sign}${(abs / 1000000).toFixed(1)}백만원`;
  if (abs >= 10000) return `${sign}${Math.round(abs / 10000)}만원`;
  return `${sign}${abs.toLocaleString()}원`;
}

export function fmtComma(n: number): string {
  return n.toLocaleString('ko-KR');
}

export function fmtPct(n: number): string {
  return `${n}%`;
}
