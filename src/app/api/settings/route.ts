import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: () => Promise<Record<string, unknown> | null>;
    };
  };
};

// GET: 사용자 설정 조회
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  try {
    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;
    if (!db) return NextResponse.json({ user: null });

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

// POST: 사용자 설정 저장/수정
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, name, phone, bizType, region, taxType,
      empCount, workDays, workHours,
      costRent, costLabor, costMaterial, costOther,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;
    if (!db) return NextResponse.json({ error: 'DB not available' }, { status: 500 });

    const normalizedPhone = phone ? phone.replace(/-/g, '') : '';

    const existing = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    if (!existing) {
      await db.prepare(
        `INSERT INTO users (id, name, phone, biz_type, region, tax_type, emp_count, work_days, work_hours, cost_rent, cost_labor, cost_material, cost_other)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        userId, name || '', normalizedPhone, bizType || 'restaurant',
        region || 'daegu', taxType || 'general',
        empCount || 0, workDays || 25, workHours || 10,
        costRent || 0, costLabor || 0, costMaterial || 0, costOther || 0
      ).run();
    } else {
      await db.prepare(
        `UPDATE users SET name=?, phone=?, biz_type=?, region=?, tax_type=?, emp_count=?, work_days=?, work_hours=?, cost_rent=?, cost_labor=?, cost_material=?, cost_other=? WHERE id=?`
      ).bind(
        name || '', normalizedPhone, bizType || 'restaurant',
        region || 'daegu', taxType || 'general',
        empCount || 0, workDays || 25, workHours || 10,
        costRent || 0, costLabor || 0, costMaterial || 0, costOther || 0,
        userId
      ).run();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
