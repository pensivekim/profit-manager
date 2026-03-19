import { NextRequest, NextResponse } from 'next/server';
import { sendSms } from '@/lib/alimtalk';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => { run: () => Promise<unknown> };
  };
};

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || !/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/-/g, '');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // D1 저장
    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;
    if (db) {
      await db.prepare(
        `INSERT OR REPLACE INTO auth_codes (phone, code, expires_at) VALUES (?, ?, ?)`
      ).bind(normalizedPhone, code, expiresAt).run();
    }

    // SMS 발송
    const nhnAppKey = env.NHN_APPKEY as string;
    const nhnSecretKey = env.NHN_SECRET_KEY as string;
    const adminPhone = env.ADMIN_PHONE as string;

    if (nhnAppKey && nhnSecretKey && adminPhone) {
      const result = await sendSms({
        appKey: nhnAppKey,
        secretKey: nhnSecretKey,
        senderNo: adminPhone,
        recipientNo: normalizedPhone,
        body: `[경영파트너] 인증번호: ${code} (5분 내 입력)`,
      });
      if (!result.success) {
        console.log('[AUTH CODE - SMS failed, code:]', code);
      }
    } else {
      console.log('[AUTH CODE - no SMS config, code:]', code);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send code error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
