import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: () => Promise<Record<string, unknown> | null>;
    };
  };
};

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: 'Missing phone or code' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/-/g, '');
    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;

    if (!db) {
      return NextResponse.json({ error: 'DB not available' }, { status: 500 });
    }

    // 코드 조회
    const row = await db.prepare(
      'SELECT code, expires_at FROM auth_codes WHERE phone = ?'
    ).bind(normalizedPhone).first();

    if (!row) {
      return NextResponse.json({ error: 'No code found. Please request a new code.' }, { status: 400 });
    }

    // 만료 확인
    if (new Date(row.expires_at as string) < new Date()) {
      await db.prepare('DELETE FROM auth_codes WHERE phone = ?').bind(normalizedPhone).run();
      return NextResponse.json({ error: 'Code expired. Please request a new code.' }, { status: 400 });
    }

    // 코드 일치 확인
    if (row.code !== code) {
      return NextResponse.json({ error: 'Wrong code' }, { status: 400 });
    }

    // 코드 삭제
    await db.prepare('DELETE FROM auth_codes WHERE phone = ?').bind(normalizedPhone).run();

    // 사용자 확인/생성
    const userId = `user-${normalizedPhone}`;
    const existing = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    let isNew = false;

    if (!existing) {
      await db.prepare(
        `INSERT INTO users (id, phone, plan) VALUES (?, ?, 'free')`
      ).bind(userId, normalizedPhone).run();
      isNew = true;
    }

    // JWT 발급
    const token = await signToken(userId);

    return NextResponse.json({ success: true, token, userId, isNew });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
