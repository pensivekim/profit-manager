import { NextRequest, NextResponse } from 'next/server';
import { calcAll } from '@/lib/taxCalc';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { fmtComma } from '@/lib/format';

export const runtime = 'edge';

const GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/f6c784dae2ac774f3f877b4ba39a88d6/carebot/google-ai-studio';
const MODEL = 'gemini-2.5-flash-lite';

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

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: () => Promise<Record<string, unknown> | null>;
    };
  };
};

async function getAiComment(env: Record<string, unknown>, bizName: string, profit: number, hourly: number, diff: string): Promise<string> {
  const apiKey = env.GEMINI_API_KEY as string;
  if (!apiKey) return '';

  try {
    const prompt = `소상공인 경영 파트너입니다.
아래 데이터를 보고 사장님께 따뜻한 한마디를 해주세요.
50자 이내, 반말 금지, 숫자 언급 가능.

업종: ${bizName}
이번주 실수령액: ${fmtComma(profit)}원
시간당: ${fmtComma(hourly)}원
전주 대비: ${diff}

한마디만, 다른 내용 없이:`;

    const res = await fetch(`${GATEWAY_BASE}/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 100 },
      }),
    });

    if (!res.ok) return '';
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    return text.slice(0, 80);
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, revenue } = body;

    if (!userId || !revenue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const env = process.env as Record<string, unknown>;
    const db = env.DB as D1DB | undefined;

    // 고정비용 조회
    let bizType: BizType = 'restaurant';
    let taxType = 'general';
    let empCount = 0;
    let workDays = 25;
    let workHours = 10;
    let costRent = 0, costLabor = 0, costMaterial = 0, costOther = 0;
    let userName = '사장';

    if (db) {
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      if (user) {
        bizType = (user.biz_type as BizType) || 'restaurant';
        taxType = (user.tax_type as string) || 'general';
        empCount = (user.emp_count as number) || 0;
        workDays = (user.work_days as number) || 25;
        workHours = (user.work_hours as number) || 10;
        userName = (user.name as string) || '사장';
        // 사용자가 저장한 고정비용 사용
        if (user.cost_rent || user.cost_labor || user.cost_material || user.cost_other) {
          costRent = (user.cost_rent as number) || 0;
          costLabor = (user.cost_labor as number) || 0;
          costMaterial = (user.cost_material as number) || 0;
          costOther = (user.cost_other as number) || 0;
        }
      }
    }

    const bm = BENCHMARKS[bizType];
    const rev = Number(revenue);
    // 사용자 고정비용이 없으면 업종 평균으로 계산
    if (costRent === 0 && costLabor === 0 && costMaterial === 0 && costOther === 0) {
      costRent = Math.round(rev * bm.rent / 100);
      costLabor = Math.round(rev * bm.labor / 100);
      costMaterial = Math.round(rev * bm.material / 100);
      costOther = Math.round(rev * bm.other / 100);
    }

    const result = calcAll({
      bizType, taxType: taxType as 'general' | 'simplified',
      revenue: rev, costRent, costLabor, costMaterial, costOther,
      empCount, workDays, workHours,
    });

    // 전주 데이터 조회
    let prevProfit: number | null = null;
    let diffStr = '첫 주 기록';
    const weekStart = getMonday();
    const lastWeekStart = getLastMonday();

    if (db) {
      const prev = await db.prepare(
        'SELECT final_profit FROM weekly_records WHERE user_id = ? AND week_start = ?'
      ).bind(userId, lastWeekStart).first();
      if (prev) {
        prevProfit = prev.final_profit as number;
        const d = result.finalProfit - prevProfit;
        diffStr = d >= 0 ? `+${fmtComma(d)}원` : `${fmtComma(d)}원`;
      }
    }

    // AI 한마디
    const aiComment = await getAiComment(env, bm.name, result.finalProfit, result.hourlyWage, diffStr);

    // D1 저장
    if (db) {
      const recordId = `wr-${userId}-${weekStart}`;
      await db.prepare(
        `INSERT OR REPLACE INTO weekly_records (id, user_id, week_start, revenue, cost_rent, cost_labor, cost_material, cost_other, final_profit, hourly_wage, ai_comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(recordId, userId, weekStart, rev, costRent, costLabor, costMaterial, costOther,
        result.finalProfit, result.hourlyWage, aiComment
      ).run();
    }

    return NextResponse.json({
      success: true,
      finalProfit: result.finalProfit,
      hourlyWage: result.hourlyWage,
      aiComment,
      diff: diffStr,
      prevProfit,
      userName,
    });
  } catch (err) {
    console.error('Weekly API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
