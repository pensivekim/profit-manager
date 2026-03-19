export interface WeeklyRecord {
  week_start: string;
  revenue: number;
  final_profit: number;
  hourly_wage: number;
  ai_comment?: string;
  cost_rent?: number;
  cost_labor?: number;
  cost_material?: number;
  cost_other?: number;
}

export interface Alert {
  type: 'danger' | 'warning' | 'info';
  msg: string;
  link?: string;
}

const MIN_WAGE = 10030;

export function checkAlerts(records: WeeklyRecord[]): Alert[] {
  const alerts: Alert[] = [];
  if (records.length === 0) return alerts;

  // 3주 연속 하락
  if (records.length >= 3) {
    const [w1, w2, w3] = records; // newest first
    if (w1.final_profit < w2.final_profit && w2.final_profit < w3.final_profit) {
      alerts.push({ type: 'warning', msg: '3주 연속 수익이 줄고 있어요. AI 조언을 확인해보세요.', link: '/calc' });
    }
  }

  // 최저임금 이하
  if (records[0]?.hourly_wage > 0 && records[0].hourly_wage < MIN_WAGE) {
    alerts.push({ type: 'danger', msg: '시간당 수익이 최저임금보다 낮아요.' });
  }

  // 적자
  if (records[0]?.final_profit < 0) {
    alerts.push({ type: 'danger', msg: '이번 주 적자입니다. 비용 점검이 필요해요.' });
  }

  return alerts;
}

export function checkMissingWeeks(records: WeeklyRecord[]): Alert | null {
  if (records.length < 2) return null;

  // 최근 기록의 week_start 확인
  const latest = new Date(records[0].week_start);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 14) {
    return { type: 'info', msg: '2주째 입력이 없어요. 지금 입력하러 가기 \u2192', link: '/weekly' };
  }
  return null;
}
