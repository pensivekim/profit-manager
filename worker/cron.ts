interface Env {
  DB: D1Database;
  NHN_APPKEY: string;
  NHN_SECRET_KEY: string;
  NHN_SENDER_KEY: string;
  ADMIN_PHONE: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
}

interface D1Row {
  [key: string]: string | number | null;
}

const NHN_ALIMTALK_URL = 'https://api-alimtalk.cloud.toast.com/alimtalk/v2.3/appkeys';
const NHN_SMS_URL = 'https://api-sms.cloud.toast.com/sms/v3.0/appkeys';
const BASE_URL = 'https://pro.genomic.cc';

function normalizePhone(phone: string): string {
  return phone.replace(/-/g, '');
}

function getMonday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  return monday.toISOString().slice(0, 10);
}

function getLastMonday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff - 7);
  return monday.toISOString().slice(0, 10);
}

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}~`;
}

function fmtComma(n: number): string {
  return n.toLocaleString('ko-KR');
}

async function sendAlimtalk(env: Env, templateCode: string, recipientNo: string, params: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(`${NHN_ALIMTALK_URL}/${env.NHN_APPKEY}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Secret-Key': env.NHN_SECRET_KEY,
      },
      body: JSON.stringify({
        senderKey: env.NHN_SENDER_KEY,
        templateCode,
        requestDate: '',
        senderGroupingKey: `cron_${Date.now()}`,
        recipientList: [{
          recipientNo: normalizePhone(recipientNo),
          templateParameter: params,
        }],
      }),
    });
    const result = await res.json() as { header?: { isSuccessful?: boolean } };
    return res.ok && result.header?.isSuccessful !== false;
  } catch {
    return false;
  }
}

async function sendSmsFallback(env: Env, recipientNo: string, body: string): Promise<boolean> {
  try {
    const res = await fetch(`${NHN_SMS_URL}/${env.NHN_APPKEY}/sender/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Secret-Key': env.NHN_SECRET_KEY,
      },
      body: JSON.stringify({
        body,
        sendNo: normalizePhone(env.ADMIN_PHONE),
        recipientList: [{ recipientNo: normalizePhone(recipientNo) }],
      }),
    });
    const result = await res.json() as { header?: { isSuccessful?: boolean } };
    return res.ok && result.header?.isSuccessful !== false;
  } catch {
    return false;
  }
}

async function logSend(db: D1Database, userId: string, templateCode: string, status: string, errorMsg?: string) {
  const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await db.prepare(
    `INSERT INTO alimtalk_logs (id, user_id, template_code, status, error_msg) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, userId, templateCode, status, errorMsg || null).run();
}

// ── 푸시 알림 발송 ──
async function sendPushNotifications(db: D1Database, title: string, body: string, url: string) {
  try {
    const { results } = await db.prepare(
      'SELECT user_id, endpoint, p256dh, auth FROM push_subscriptions'
    ).all<D1Row>();

    for (const sub of results || []) {
      try {
        const endpoint = sub.endpoint as string;
        // Web Push requires crypto signing - in Workers we send via fetch with VAPID
        // For now, log that push would be sent. Full web-push requires JWT signing.
        await logSend(db, (sub.user_id as string) || '', 'PUSH', 'queued', `${title}: ${body}`);
        // Actual push via endpoint
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'TTL': '86400' },
          body: JSON.stringify({ title, body, url }),
        }).catch(() => {});
      } catch {
        // skip individual failures
      }
    }
  } catch {
    // push table may not exist yet
  }
}

// ── 월요일: 입력 리마인더 ──
async function sendMondayReminder(env: Env) {
  const weekStart = getMonday();
  const weekLabel = getWeekLabel(weekStart);

  const { results } = await env.DB.prepare(`
    SELECT u.id, u.name, u.phone FROM users u
    WHERE u.phone IS NOT NULL AND u.notify_enabled = 1
    AND NOT EXISTS (
      SELECT 1 FROM weekly_records w
      WHERE w.user_id = u.id AND w.week_start = ?
    )
  `).bind(weekStart).all<D1Row>();

  for (const user of results || []) {
    const name = (user.name as string) || '사장';
    const phone = user.phone as string;
    const userId = user.id as string;

    const ok = await sendAlimtalk(env, 'WEEKLY_REMIND', phone, {
      name,
      week: weekLabel,
      url: `${BASE_URL}/weekly`,
    });

    if (!ok) {
      const smsOk = await sendSmsFallback(env, phone,
        `[사장님경영파트너] ${name}님, 이번 주(${weekLabel}) 매출 아직 입력 안 하셨어요. 30초면 충분해요! ${BASE_URL}/weekly`
      );
      await logSend(env.DB, userId, 'WEEKLY_REMIND', smsOk ? 'sms_sent' : 'failed', ok ? undefined : 'alimtalk_failed');
    } else {
      await logSend(env.DB, userId, 'WEEKLY_REMIND', 'sent');
    }
  }

  // 푸시 알림도 함께 발송
  await sendPushNotifications(env.DB,
    '이번 주 매출 입력하셨나요?',
    '30초면 충분해요. 지금 입력하러 가기!',
    `${BASE_URL}/weekly`
  );

  console.log(`Monday reminder: ${(results || []).length} users processed`);
}

// ── 금요일: 주간 성적표 ──
async function sendFridayReport(env: Env) {
  const weekStart = getMonday();
  const lastWeekStart = getLastMonday();
  const weekLabel = getWeekLabel(weekStart);

  const { results } = await env.DB.prepare(`
    SELECT
      u.id, u.name, u.phone, u.biz_type,
      w.revenue, w.final_profit, w.hourly_wage,
      w.cost_material, w.cost_rent, w.cost_labor, w.cost_other,
      pw.revenue as prev_revenue, pw.final_profit as prev_profit
    FROM users u
    JOIN weekly_records w ON w.user_id = u.id AND w.week_start = ?
    LEFT JOIN weekly_records pw ON pw.user_id = u.id AND pw.week_start = ?
    WHERE u.phone IS NOT NULL AND u.notify_enabled = 1
  `).bind(weekStart, lastWeekStart).all<D1Row>();

  for (const row of results || []) {
    const name = (row.name as string) || '사장';
    const phone = row.phone as string;
    const userId = row.id as string;
    const revenue = (row.revenue as number) || 0;
    const profit = (row.final_profit as number) || 0;
    const hourlyWage = (row.hourly_wage as number) || 0;
    const prevProfit = (row.prev_profit as number) || 0;
    const diff = prevProfit !== 0 ? profit - prevProfit : 0;
    const diffStr = diff >= 0 ? `+${fmtComma(diff)}원` : `${fmtComma(diff)}원`;

    // 코멘트 생성
    let comment: string;
    if (profit > 0 && diff > 0) {
      const monthly = Math.round(profit * 4.3);
      comment = `잘 하고 계세요! 이 추세면 이번 달 ${fmtComma(monthly)}원 예상이에요.`;
    } else if (hourlyWage > 0 && hourlyWage < 10030) {
      comment = '시간당 수익이 최저임금보다 낮아요. AI 조언을 확인해보세요.';
    } else if (profit < 0) {
      comment = '이번 주는 적자예요. 지출 항목을 한번 점검해보세요.';
    } else {
      comment = '꾸준히 기록하는 것만으로도 대단합니다. 화이팅!';
    }

    const ok = await sendAlimtalk(env, 'WEEKLY_REPORT', phone, {
      name,
      revenue: fmtComma(revenue),
      profit: fmtComma(profit),
      diff: prevProfit !== 0 ? `지난주 대비 ${diffStr}` : '(첫 주 기록)',
      comment,
      url: `${BASE_URL}/history`,
    });

    if (!ok) {
      const smsBody = `[사장님경영파트너] ${name}님 이번 주 성적표\n매출: ${fmtComma(revenue)}원\n남은돈: ${fmtComma(profit)}원\n${comment}\n${BASE_URL}/history`;
      const smsOk = await sendSmsFallback(env, phone, smsBody);
      await logSend(env.DB, userId, 'WEEKLY_REPORT', smsOk ? 'sms_sent' : 'failed');
    } else {
      await logSend(env.DB, userId, 'WEEKLY_REPORT', 'sent');
    }
  }

  // 푸시 알림도 함께 발송
  await sendPushNotifications(env.DB,
    '이번 주 성적표가 도착했어요',
    '매출과 실수령액을 확인해보세요!',
    `${BASE_URL}/history`
  );

  console.log(`Friday report: ${(results || []).length} users processed`);
}

// ── Export ──
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const day = new Date(event.scheduledTime).getUTCDay();
    if (day === 1) {
      ctx.waitUntil(sendMondayReminder(env));
    }
    if (day === 5) {
      ctx.waitUntil(sendFridayReport(env));
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/test/monday') {
      await sendMondayReminder(env);
      return new Response('Monday reminder sent');
    }
    if (url.pathname === '/test/friday') {
      await sendFridayReport(env);
      return new Response('Friday report sent');
    }
    return new Response('profit-cron worker running');
  },
};
