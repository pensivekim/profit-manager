import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => {
      first: () => Promise<Record<string, unknown> | null>;
    };
  };
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;

    if (!db) {
      return NextResponse.json({ userId: payload.userId });
    }

    const user = await db.prepare(
      'SELECT id, name, phone, biz_type, tax_type, plan, premium_until FROM users WHERE id = ?'
    ).bind(payload.userId).first();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      bizType: user.biz_type,
      taxType: user.tax_type,
      plan: user.plan || 'free',
      premiumUntil: user.premium_until,
    });
  } catch (err) {
    console.error('Auth me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
