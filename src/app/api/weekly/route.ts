import { NextRequest, NextResponse } from 'next/server';
import { calcAll } from '@/lib/taxCalc';
import { BizType } from '@/lib/benchmarks';

export const runtime = 'edge';

function getMonday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  return monday.toISOString().slice(0, 10);
}

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: () => Promise<Record<string, unknown> | null>;
    };
  };
};

async function ensureTables(db: D1DB) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT, phone TEXT NOT NULL, biz_type TEXT DEFAULT 'restaurant',
    tax_type TEXT DEFAULT 'general', emp_count INTEGER DEFAULT 0, work_days INTEGER DEFAULT 25,
    work_hours INTEGER DEFAULT 10, notify_enabled INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now'))
  )`).bind().run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS weekly_records (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, week_start TEXT NOT NULL, revenue INTEGER DEFAULT 0,
    cost_rent INTEGER DEFAULT 0, cost_labor INTEGER DEFAULT 0, cost_material INTEGER DEFAULT 0,
    cost_other INTEGER DEFAULT 0, final_profit INTEGER DEFAULT 0, hourly_wage INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id)
  )`).bind().run();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, bizType, taxType, revenue, costRent, costLabor, costMaterial, costOther, empCount, workDays, workHours } = body;

    if (!phone || !revenue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = calcAll({
      bizType: (bizType || 'restaurant') as BizType,
      taxType: taxType || 'general',
      revenue: Number(revenue),
      costRent: Number(costRent) || 0,
      costLabor: Number(costLabor) || 0,
      costMaterial: Number(costMaterial) || 0,
      costOther: Number(costOther) || 0,
      empCount: Number(empCount) || 0,
      workDays: Number(workDays) || 25,
      workHours: Number(workHours) || 10,
    });

    try {
      const env = process.env as Record<string, unknown>;
      const db = env.DB as D1DB | undefined;
      if (db) {
        await ensureTables(db);

        const normalizedPhone = phone.replace(/-/g, '');
        const userId = `user-${normalizedPhone}`;
        const weekStart = getMonday();

        // Upsert user
        const existing = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
        if (!existing) {
          await db.prepare(
            `INSERT INTO users (id, name, phone, biz_type, tax_type, emp_count, work_days, work_hours)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(userId, name || '', normalizedPhone, bizType || 'restaurant', taxType || 'general',
            empCount || 0, workDays || 25, workHours || 10
          ).run();
        } else {
          await db.prepare(
            `UPDATE users SET name = ?, biz_type = ?, tax_type = ?, emp_count = ?, work_days = ?, work_hours = ? WHERE id = ?`
          ).bind(name || '', bizType || 'restaurant', taxType || 'general',
            empCount || 0, workDays || 25, workHours || 10, userId
          ).run();
        }

        // Insert weekly record
        const recordId = `wr-${userId}-${weekStart}`;
        await db.prepare(
          `INSERT OR REPLACE INTO weekly_records (id, user_id, week_start, revenue, cost_rent, cost_labor, cost_material, cost_other, final_profit, hourly_wage)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(recordId, userId, weekStart, revenue, costRent || 0, costLabor || 0, costMaterial || 0, costOther || 0,
          result.finalProfit, result.hourlyWage
        ).run();
      }
    } catch {
      // D1 unavailable
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('Weekly API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
