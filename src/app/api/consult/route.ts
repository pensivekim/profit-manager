import { NextRequest, NextResponse } from 'next/server';
import { sendAlimtalk, sendSms } from '@/lib/alimtalk';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => { run: () => Promise<unknown> };
  };
};

async function ensureTable(db: D1DB) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS consult_requests (
      id TEXT PRIMARY KEY,
      pro_type TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      message TEXT,
      record_snapshot TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).bind().run();
}

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

    // D1 저장
    try {
      const env = process.env as Record<string, unknown>;
      const db = env.DB as D1DB | undefined;

      if (db) {
        await ensureTable(db);
        await db.prepare(
          `INSERT INTO consult_requests (id, pro_type, name, phone, message, record_snapshot, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id, proType, name, phone,
          message || '',
          shareData ? JSON.stringify(recordSnapshot) : null,
          'pending'
        ).run();
      }
    } catch {
      // D1 unavailable - continue with notifications
    }

    // 알림 발송
    const nhnAppKey = process.env.NHN_APPKEY;
    const nhnSecretKey = process.env.NHN_SECRET_KEY;
    const nhnSenderKey = process.env.NHN_SENDER_KEY;
    const adminPhone = process.env.ADMIN_PHONE;

    if (nhnAppKey && nhnSecretKey && nhnSenderKey && adminPhone) {
      // 1. 관리자 알림톡
      const adminResult = await sendAlimtalk({
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

      // 알림톡 실패 시 SMS fallback
      if (!adminResult.success) {
        await sendSms({
          appKey: nhnAppKey,
          secretKey: nhnSecretKey,
          senderNo: adminPhone,
          recipientNo: adminPhone,
          body: `[pro.genomic.cc] ${proLabel} 상담신청\n${name} / ${phone}\n${message || ''}`,
        });
      }

      // 2. 신청자 확인 알림톡
      const userResult = await sendAlimtalk({
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

      // 알림톡 실패 시 SMS fallback
      if (!userResult.success) {
        await sendSms({
          appKey: nhnAppKey,
          secretKey: nhnSecretKey,
          senderNo: adminPhone,
          recipientNo: phone,
          body: `[pro.genomic.cc] ${name}님, ${proLabel} 상담 신청이 접수되었습니다. 1영업일 내 연락드리겠습니다.`,
        });
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('Consult API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
