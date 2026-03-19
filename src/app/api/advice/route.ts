import { NextRequest, NextResponse } from 'next/server';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { fmtComma } from '@/lib/format';

// Cloudflare AI Gateway 경유 Gemini
const GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/f6c784dae2ac774f3f877b4ba39a88d6/carebot/google-ai-studio';
const MODEL = 'gemini-2.5-flash-lite';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calcResult, bizType, taxType, revenue, empCount } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const bm = BENCHMARKS[bizType as BizType];

    const systemPrompt = `당신은 소상공인 경영 전문 어드바이저입니다.
사업자의 월별 수입/지출/세금 데이터를 분석하여 실질적이고 구체적인 경영 조언을 제공합니다.

조언 규칙:
- 업종 특성을 반영한 맞춤 조언
- 업종 평균 대비 초과/절감 항목 분석
- 세금 부담 경감 방법 구체적 제시
- 실행 가능한 단기 액션 포함
- 한국 소상공인 세제/지원제도 반영

반드시 아래 JSON 형식으로만 응답하세요:
{"advices":[{"type":"danger|warning|good|info","title":"제목","body":"본문(2-3문장)","proLink":"tax|labor|legal|none"}]}
- 3~5개 조언 생성
- type: danger(위험), warning(주의), good(양호), info(참고)
- proLink: 관련 전문가 연결 (tax=세무사, labor=노무사, legal=변호사, none=없음)`;

    const userPrompt = `## 사업자 정보
- 업종: ${bm.name} (${bizType})
- 과세유형: ${taxType === 'general' ? '일반과세자' : '간이과세자'}
- 직원 수: ${empCount}명

## 월간 경영 데이터
- 월 매출: ${fmtComma(revenue)}원
- 임대료: ${fmtComma(calcResult.costRent || 0)}원 (매출 대비 ${calcResult.rentPct}%, 업종평균 ${bm.rent}%)
- 인건비: ${fmtComma(calcResult.costLabor || 0)}원 (매출 대비 ${calcResult.laborPct}%, 업종평균 ${bm.labor}%)
- 재료/매입: ${fmtComma(calcResult.costMaterial || 0)}원 (매출 대비 ${calcResult.materialPct}%, 업종평균 ${bm.material}%)
- 기타경비: ${fmtComma(calcResult.costOther || 0)}원 (매출 대비 ${calcResult.otherPct}%, 업종평균 ${bm.other}%)

## 계산 결과
- 영업이익: ${fmtComma(calcResult.opProfit)}원
- 부가세 적립: ${fmtComma(calcResult.vatProvision)}원/월
- 종합소득세(월할): ${fmtComma(calcResult.monthlyIncomeTax)}원
- 4대보험 부담: ${fmtComma(calcResult.insuranceCost)}원
- 최종 실수령액: ${fmtComma(calcResult.finalProfit)}원
- 시간당 수익: ${fmtComma(calcResult.hourlyWage)}원

이 데이터를 분석하여 경영 조언을 JSON으로 제공해주세요.`;

    const endpoint = `${GATEWAY_BASE}/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
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

    // JSON 파싱 (코드블록 감싸진 경우 처리)
    const jsonMatch = text.match(/\{[\s\S]*"advices"[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
    }

    const advices = JSON.parse(jsonMatch[0]);
    return NextResponse.json(advices);
  } catch (err) {
    console.error('Advice API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
