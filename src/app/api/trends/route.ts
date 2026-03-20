import { NextRequest, NextResponse } from 'next/server';
import { BENCHMARKS, BizType } from '@/lib/benchmarks';
import { RegionCode, getRegionLabel } from '@/lib/regions';

export const runtime = 'edge';

const GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/f6c784dae2ac774f3f877b4ba39a88d6/carebot/google-ai-studio';
const MODEL = 'gemini-2.5-flash-lite';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bizType, region, revenue } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const bm = BENCHMARKS[(bizType as BizType) || 'restaurant'];
    const regionLabel = region ? getRegionLabel(region as RegionCode) : '전국';
    const revMan = Math.round((revenue || 20000000) / 10000);

    const now = new Date();
    const month = now.getMonth() + 1;
    const season = month <= 2 || month === 12 ? '겨울' : month <= 5 ? '봄' : month <= 8 ? '여름' : '가을';

    const prompt = `당신은 ${bm.name} 업종에서 10년 경력의 마케팅 전문가입니다.
${regionLabel}에서 월 ${revMan}만원 매출을 올리는 사장님에게 지금 당장 실행할 수 있는 구체적 조언을 해주세요.

현재: 2026년 ${month}월, ${season}

## 규칙
- 뻔한 말("SNS를 활용하세요", "블로그를 쓰세요") 금지
- 사장님이 오늘 바로 실행할 수 있는 구체적 액션만
- 실제 성공 사례나 구체적 숫자 포함
- ${regionLabel} 지역 특성 반영 필수

## 요청 항목 (총 5개)

1. 지원금 1개: 2026년 ${month}월 현재 ${regionLabel} ${bm.name}이 신청 가능한 정부/지자체 지원금. 금액, 신청처, 마감일 포함.

2. 마케팅 액션 2개:
   - 돈 안 드는 것 1개: 오늘 당장 할 수 있는 것. 예) "네이버 플레이스 리뷰 이벤트: 리뷰 남기면 음료 1잔 무료. 실제로 대구 OO식당은 이걸로 월 리뷰 50개→200개로 늘림"
   - 소액 투자(10만원 이내) 1개: 예) "${season} 시즌 한정 메뉴 출시 + 인스타 릴스 촬영. 촬영비 0원, 재료비 5만원으로 신규 고객 유입"

3. 블로그 글 제목 2개:
   - 네이버 검색 상위 노출될 수 있는 실제 블로그 글 제목
   - 제목에 지역명+업종 키워드 포함
   - 글의 목차(3~4개)까지 제안
   - 예) 제목: "${regionLabel} 직장인 점심 맛집 BEST 5 (2026년 ${month}월)" / 목차: 1) 가성비 끝판왕 OO 2) 혼밥 성지 OO 3) ...

JSON 형식으로만 응답. 다른 텍스트 없이:
{"items":[{"type":"subsidy","icon":"📢","title":"20자이내","body":"3~4문장 구체적 내용"},{"type":"marketing","icon":"💡","title":"20자이내","body":"3~4문장"},{"type":"marketing","icon":"💡","title":"20자이내","body":"3~4문장"},{"type":"blog","icon":"✍️","title":"블로그 글 제목","body":"목차와 기대 효과"},{"type":"blog","icon":"✍️","title":"블로그 글 제목","body":"목차와 기대 효과"}]}`;

    const endpoint = `${GATEWAY_BASE}/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Trends Gemini error:', errText);
      return NextResponse.json({ error: 'AI API call failed' }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*"items"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse trends response:', text);
      return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Trends API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
