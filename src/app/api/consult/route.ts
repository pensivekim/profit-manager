import { NextRequest, NextResponse } from 'next/server';
import { sendAlimtalk } from '@/lib/alimtalk';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proType, name, phone, message, recordSnapshot, shareData } = body;

    if (!proType || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `consult-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const proLabels: Record<string, string> = {
      tax: '세무사',
      labor: '노무사',
      legal: '변호사',
    };
    const proLabel = proLabels[proType] || proType;

    // D1 저장 시도
    try {
      const env = process.env as Record<string, unknown>;
      const db = env.DB as {
        prepare: (q: string) => {
          bind: (...args: unknown[]) => { run: () => Promise<unknown> };
        };
      } | undefined;

      if (db) {
        await db.prepare(
          `INSERT INTO consult_requests (id, business_id, pro_type, status, message, record_snapshot)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          id, 'guest', proType, 'pending',
          `[${name}/${phone}] ${message || ''}`,
          shareData ? JSON.stringify(recordSnapshot) : null
        ).run();
      }
    } catch {
      // D1 unavailable
    }

    // 관리자 알림톡
    const nhnAppKey = process.env.NHN_APPKEY;
    const nhnSecretKey = process.env.NHN_SECRET_KEY;
    const nhnSenderKey = process.env.NHN_SENDER_KEY;
    const adminPhone = process.env.ADMIN_PHONE;

    if (nhnAppKey && nhnSecretKey && nhnSenderKey && adminPhone) {
      // 관리자에게 알림
      await sendAlimtalk({
        appKey: nhnAppKey,
        secretKey: nhnSecretKey,
        senderKey: nhnSenderKey,
        templateCode: 'CONSULT_PHONE',
        recipientNo: adminPhone,
        templateParameter: {
          name,
          phone,
          proType: proLabel,
          message: message || '(내용 없음)',
        },
      });

      // 신청자 확인 알림
      await sendAlimtalk({
        appKey: nhnAppKey,
        secretKey: nhnSecretKey,
        senderKey: nhnSenderKey,
        templateCode: 'CONSULT_CONFIRM',
        recipientNo: phone,
        templateParameter: {
          name,
          proType: proLabel,
        },
      });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('Consult API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
