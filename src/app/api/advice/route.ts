import { NextRequest, NextResponse } from 'next/server';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { fmtComma } from '@/lib/format';

export const runtime = 'edge';

const GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/f6c784dae2ac774f3f877b4ba39a88d6/carebot/google-ai-studio';
const MODEL = 'gemini-2.5-flash-lite';
const MIN_WAGE = 10030;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calcResult, bizType, taxType, revenue, empCount } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const bm = BENCHMARKS[bizType as BizType];
    const hourlyWage = calcResult.hourlyWage || 0;
    const wageDiff = hourlyWage - MIN_WAGE;

    const systemPrompt = `당신은 소상공인 전문 경영 어드바이저입니다.
친근하고 따뜻한 말투로, 어려운 용어 없이, 사장님이 바로 실천할 수 있는 조언을 드립니다.
절대 겁주지 말고, 희망과 함께 현실적 방법을 제시하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{"advices":[{"type":"danger|warning|good|info","title":"제목(10자이내)","body":"2~3문장 구체적 실천 조언","proLink":"tax|labor|legal|none"}]}

4~5개 조언을 생성하세요.
- type: danger(위험-빨강), warning(주의-주황), good(양호-초록), info(참고-파랑)
- proLink: 관련 전문가 (tax=세무사, labor=노무사, legal=변호사, none=없음)
- title은 반드시 10자 이내
- body는 구체적 금액과 실천 방법 포함`;

    const userPrompt = `## 사장님 정보
- 업종: ${bm.name}
- 과세유형: ${taxType === 'general' ? '일반과세자' : '간이과세자'}
- 직원 수: ${empCount}명

## 월간 경영 숫자
- 월 매출: ${fmtComma(revenue)}원
- 임대료: ${fmtComma(calcResult.costRent || 0)}원 (${calcResult.rentPct}%, 업종평균 ${bm.rent}%)
- 인건비: ${fmtComma(calcResult.costLabor || 0)}원 (${calcResult.laborPct}%, 업종평균 ${bm.labor}%)
- 재료/매입: ${fmtComma(calcResult.costMaterial || 0)}원 (${calcResult.materialPct}%, 업종평균 ${bm.material}%)
- 기타경비: ${fmtComma(calcResult.costOther || 0)}원 (${calcResult.otherPct}%, 업종평균 ${bm.other}%)

## 세금/보험
- 부가세 적립: 월 ${fmtComma(calcResult.vatProvision)}원
- 종합소득세: 월 ${fmtComma(calcResult.monthlyIncomeTax)}원
- 4대보험: 월 ${fmtComma(calcResult.insuranceCost)}원
- 세금 합계: 월 ${fmtComma(calcResult.totalTax)}원

## 최종 결과
- 영업이익: ${fmtComma(calcResult.opProfit)}원
- 실수령액: ${fmtComma(calcResult.finalProfit)}원
- 시간당 수익: ${fmtComma(hourlyWage)}원 (최저임금 ${fmtComma(MIN_WAGE)}원 대비 ${wageDiff >= 0 ? '+' : ''}${fmtComma(wageDiff)}원)

이 사장님에게 따뜻하고 실질적인 경영 조언을 해주세요.`;

    const endpoint = `${GATEWAY_BASE}/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: 'AI API call failed' }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*"advices"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
    }

    const advices = JSON.parse(jsonMatch[0]);
    return NextResponse.json(advices);
  } catch (err) {
    console.error('Advice API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
