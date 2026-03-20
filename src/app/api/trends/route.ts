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

    const prompt = `당신은 소상공인을 돕는 경영 컨설턴트입니다.
아래 사장님의 업종과 지역에 맞는 최신 정보를 제공해주세요.

사장님 정보:
- 업종: ${bm.name}
- 지역: ${regionLabel}
- 월 매출: 약 ${Math.round((revenue || 20000000) / 10000)}만원

아래 3가지 카테고리에서 각각 1~2개씩, 총 4~5개 항목을 찾아주세요:

1. 정부/지자체 지원금/혜택 (2026년 현재 신청 가능한 것)
   - 소진공, 중기부, 지자체 지원사업
   - 세금 감면, 대출 우대 등

2. 지역 마케팅 아이디어
   - ${regionLabel} 지역 최신 트렌드
   - 동종 업계 성공 마케팅 사례 (무료 시음/시식, 콜라보 이벤트 등)
   - SNS/블로그 활용 팁

3. 블로그 글감 추천
   - 이 업종 사장님이 쓰면 좋은 블로그 주제 1~2개
   - 고객 유입에 도움되는 키워드 포함

반드시 아래 JSON 형식으로만 응답하세요:
{"items":[{"type":"subsidy|marketing|blog","icon":"📢|💡|✍️","title":"제목(20자이내)","body":"2~3문장 구체적 내용","link":"관련 URL 또는 빈문자열"}]}`;

    const endpoint = `${GATEWAY_BASE}/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
        },
        tools: [{ google_search: {} }],
      }),
    });

    if (!res.ok) {
      console.error('Trends API error:', await res.text());
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
