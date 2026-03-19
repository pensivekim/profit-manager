import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get('businessId') || 'guest';

    const env = process.env as Record<string, unknown>;
    const db = env.DB as {
      prepare: (q: string) => {
        bind: (...args: unknown[]) => {
          all: () => Promise<{ results: Record<string, unknown>[] }>;
        };
      };
    } | undefined;

    if (!db) {
      return NextResponse.json({ records: [], message: 'DB not available' });
    }

    const { results } = await db.prepare(
      `SELECT * FROM monthly_records
       WHERE business_id = ?
       ORDER BY year_month DESC
       LIMIT 6`
    ).bind(businessId).all();

    // 오래된 순으로 정렬 (차트용)
    const records = (results || []).reverse();

    return NextResponse.json({ records });
  } catch (err) {
    console.error('History API error:', err);
    return NextResponse.json({ records: [], error: 'Failed to fetch records' });
  }
}
