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

    const prompt = `당신은 소상공인을 돕는 경영 컨설턴트입니다.
아래 사장님의 업종과 지역에 맞는 최신 정보를 제공해주세요.

사장님 정보:
- 업종: ${bm.name}
- 지역: ${regionLabel}
- 월 매출: 약 ${revMan}만원

아래 3가지 카테고리에서 각각 1~2개씩, 총 4~5개 항목을 알려주세요:

1. 정부/지자체 지원금/혜택 (2026년 현재 신청 가능한 것)
2. 지역 마케팅 아이디어 (${regionLabel} 지역 트렌드, 무료 시음/시식, 콜라보, SNS 팁)
3. 블로그 글감 추천 (고객 유입에 도움되는 키워드 포함)

반드시 아래 JSON 형식으로만 응답하세요. JSON 외에 다른 텍스트를 절대 포함하지 마세요:
{"items":[{"type":"subsidy","icon":"📢","title":"제목","body":"내용","link":""},{"type":"marketing","icon":"💡","title":"제목","body":"내용","link":""},{"type":"blog","icon":"✍️","title":"제목","body":"내용","link":""}]}

type은 subsidy, marketing, blog 중 하나입니다.`;

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
