import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => {
      all: () => Promise<{ results: Record<string, unknown>[] }>;
    };
  };
};

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'weekly';
    const userId = req.nextUrl.searchParams.get('userId') || '';

    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;

    if (!db) {
      return NextResponse.json({ records: [] });
    }

    if (type === 'weekly') {
      const weeks = Number(req.nextUrl.searchParams.get('weeks')) || 8;
      const { results } = await db.prepare(
        `SELECT week_start, revenue, final_profit, hourly_wage, ai_comment,
                cost_rent, cost_labor, cost_material, cost_other
         FROM weekly_records
         WHERE user_id = ?
         ORDER BY week_start DESC
         LIMIT ?`
      ).bind(userId, weeks).all();

      return NextResponse.json({ records: results || [] });
    }

    if (type === 'monthly') {
      const months = Number(req.nextUrl.searchParams.get('months')) || 6;
      // 주간 데이터를 월별로 집계
      const { results } = await db.prepare(
        `SELECT
           substr(week_start, 1, 7) as year_month,
           SUM(revenue) as revenue,
           SUM(final_profit) as final_profit,
           AVG(hourly_wage) as hourly_wage,
           COUNT(*) as week_count
         FROM weekly_records
         WHERE user_id = ?
         GROUP BY substr(week_start, 1, 7)
         ORDER BY year_month DESC
         LIMIT ?`
      ).bind(userId, months).all();

      return NextResponse.json({ records: results || [] });
    }

    // fallback: legacy monthly_records
    const businessId = req.nextUrl.searchParams.get('businessId') || 'guest';
    const { results } = await db.prepare(
      `SELECT * FROM monthly_records WHERE business_id = ? ORDER BY year_month DESC LIMIT 6`
    ).bind(businessId).all();

    return NextResponse.json({ records: (results || []).reverse() });
  } catch (err) {
    console.error('History API error:', err);
    return NextResponse.json({ records: [] });
  }
}
