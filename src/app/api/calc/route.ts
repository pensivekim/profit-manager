import { NextRequest, NextResponse } from 'next/server';
import { calcAll } from '@/lib/taxCalc';
import { BizType } from '@/lib/benchmarks';
import { RegionCode } from '@/lib/regions';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const params = {
      bizType: body.bizType as BizType,
      taxType: body.taxType as 'general' | 'simplified',
      revenue: Number(body.revenue) || 0,
      costRent: Number(body.costRent) || 0,
      costLabor: Number(body.costLabor) || 0,
      costMaterial: Number(body.costMaterial) || 0,
      costOther: Number(body.costOther) || 0,
      empCount: Number(body.empCount) || 0,
      workDays: Number(body.workDays) || 25,
      workHours: Number(body.workHours) || 10,
      region: (body.region as RegionCode) || undefined,
    };

    if (params.revenue <= 0) {
      return NextResponse.json({ error: '매출을 입력해주세요' }, { status: 400 });
    }

    const result = calcAll(params);

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const recordId = `guest-${yearMonth}-${Date.now()}`;

    // D1 저장 시도 (환경에 DB 바인딩이 있을 때만)
    try {
      const env = (process.env as Record<string, unknown>);
      const db = env.DB as { prepare: (q: string) => { bind: (...args: unknown[]) => { run: () => Promise<unknown> } } } | undefined;
      if (db) {
        await db.prepare(
          `INSERT INTO monthly_records (id, business_id, year_month, revenue, cost_rent, cost_labor, cost_material, cost_other, vat_provision, income_tax_monthly, insurance_cost, final_profit, hourly_wage, memo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          recordId, 'guest', yearMonth,
          params.revenue, params.costRent, params.costLabor, params.costMaterial, params.costOther,
          result.vatProvision, result.monthlyIncomeTax, result.insuranceCost,
          result.finalProfit, result.hourlyWage, null
        ).run();
      }
    } catch {
      // D1 미연결 환경에서는 무시
    }

    return NextResponse.json({
      ...result,
      yearMonth,
      recordId,
      params,
    });
  } catch {
    return NextResponse.json({ error: '계산 중 오류가 발생했습니다' }, { status: 500 });
  }
}
