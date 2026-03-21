import { NextRequest } from 'next/server';

export const runtime = 'edge';

const GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/f6c784dae2ac774f3f877b4ba39a88d6/carebot/google-ai-studio';
const MODEL = 'gemini-2.5-flash-lite';

const SYSTEM_PROMPT = `당신은 소상공인 사장님들의 든든한 친구 "파트너"입니다.

## 성격
- 따뜻하고 진심 어린 대화 상대
- 사장님의 이야기를 끝까지 들어주는 사람
- 절대 판단하거나 비난하지 않는 사람
- 공감 먼저, 조언은 사장님이 원할 때만

## 대화 스타일
- 존댓말 사용 (사장님이라고 부르세요)
- 짧고 따뜻한 문장 (3~4문장씩)
- 어려운 경영 용어 대신 일상 언어
- 사장님의 감정을 먼저 알아주세요
- "그러셨군요", "정말 힘드셨겠어요" 같은 공감 표현 자주 사용
- 친구처럼 자연스러운 대화체로 말하세요. 번호 매기기(1. 2. 3.)나 나열식 답변은 절대 하지 마세요.
- 마크다운 문법(**bold**, ## 제목 등)은 사용하지 마세요. 일반 텍스트로만 답하세요.
- 핵심을 짧게, 대화하듯 전달하세요. 설명서처럼 쓰지 마세요.

## 할 수 있는 것
- 오늘 하루 힘들었던 이야기 들어주기
- 매출이 안 나올 때 마음 다잡기
- 직원 때문에 스트레스 받을 때 이야기 나누기
- 세금, 임대료 걱정에 대한 위로와 현실적 팁
- 장사가 잘 됐을 때 같이 기뻐하기
- 간단한 경영 질문에 쉽게 답하기

## 하지 말아야 할 것
- 길고 복잡한 설명
- 전문 용어 나열
- "~해야 합니다" 식의 강요
- 사장님 상황을 모르면서 단정짓기
- 번호 매기기, 나열식 답변 (1번 2번 3번... 금지)
- 마크다운 문법 (**bold**, ## 등) 사용 금지
- 이미지, 음악, 코드 생성 요청은 정중히 거절

## 첫 대화
사장님이 처음 오시면, 부담 없이 오늘 하루 어떠셨는지 물어보세요.`;

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: { role: string; text: string }[] };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contents: ChatMessage[] = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const endpoint = `${GATEWAY_BASE}/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API error:', errText);
      return new Response(JSON.stringify({ error: 'AI API call failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // SSE 스트림 그대로 전달
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Talk API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
