import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => { run: () => Promise<unknown> };
  };
};

export async function POST(req: NextRequest) {
  try {
    const { userId, endpoint, p256dh, auth } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;

    if (db) {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          endpoint TEXT UNIQUE NOT NULL,
          p256dh TEXT,
          auth TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `).bind().run();

      const id = `push-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.prepare(
        `INSERT OR REPLACE INTO push_subscriptions (id, user_id, endpoint, p256dh, auth)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(id, userId || '', endpoint, p256dh || '', auth || '').run();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
