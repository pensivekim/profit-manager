'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

/* ── 독립 컬러 시스템 (다크 모드, 눈 편안함 최적화) ── */
const T = {
  bg:       '#141414',
  bgSub:    '#1C1C1E',
  card:     '#232326',
  cardHov:  '#2A2A2E',
  border:   '#333338',
  text:     '#D8D8D8',
  textSub:  '#999',
  textDim:  '#666',
  accent:   '#7C9FCC',     // 부드러운 블루
  accentBg: '#283448',
  userBg:   '#2C3E5A',
  white:    '#E8E8E8',
};

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const STARTERS = [
  { text: '오늘 장사가 너무 안 됐어요', sub: '하루종일 손님이 없었을 때' },
  { text: '직원 때문에 스트레스 받아요', sub: '말 안 통할 때 답답한 마음' },
  { text: '세금 낼 생각하면 막막해요', sub: '벌어도 남는 게 없는 느낌' },
  { text: '이번 달은 좀 잘 됐어요!', sub: '좋은 소식도 나눠요' },
];

export default function TalkPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    setStarted(true);
    const userMsg: Message = { role: 'user', text: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    setMessages([...newMessages, { role: 'assistant', text: '' }]);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (chunk) {
              fullText += chunk;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', text: fullText };
                return updated;
              });
            }
          } catch {
            // skip
          }
        }
      }

      if (!fullText) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            text: '\uC7A0\uC2DC \uC5F0\uACB0\uC774 \uBD88\uC548\uC815\uD588\uC5B4\uC694. \uB2E4\uC2DC \uB9D0\uC500\uD574 \uC8FC\uC2DC\uACA0\uC5B4\uC694?',
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          text: '\uC8C4\uC1A1\uD574\uC694, \uC7A0\uC2DC \uBB38\uC81C\uAC00 \uC0DD\uACBC\uC5B4\uC694. \uB2E4\uC2DC \uD55C\uBC88 \uB9D0\uC500\uD574 \uC8FC\uC138\uC694.',
        };
        return updated;
      });
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  /* ════════════════════ 시작 화면 ════════════════════ */
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 max-w-xl mx-auto w-full">
          <Link href="/" style={{ fontSize: '14px', color: T.textDim, letterSpacing: '0.02em' }}>
            {"\u2190"} pro.genomic.cc
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 max-w-xl mx-auto w-full">
          {/* 타이틀 영역 */}
          <div className="text-center mb-12">
            <p style={{ fontSize: '14px', color: T.accent, letterSpacing: '0.15em', fontWeight: 600, marginBottom: '20px' }}>
              AI PARTNER
            </p>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 300,
              color: T.white,
              lineHeight: '1.5',
              letterSpacing: '-0.01em',
            }}>
              사장님,<br />
              오늘 하루 어떠셨어요?
            </h1>
            <p style={{
              marginTop: '16px',
              fontSize: '15px',
              color: T.textSub,
              lineHeight: '1.9',
              fontWeight: 300,
            }}>
              경영 고민이든, 오늘 있었던 일이든<br />
              편하게 이야기해 주세요.
            </p>
          </div>

          {/* 대화 시작 카드 */}
          <div className="w-full space-y-2.5 mb-10">
            {STARTERS.map((item) => (
              <button
                key={item.text}
                onClick={() => sendMessage(item.text)}
                className="w-full text-left rounded-xl px-5 py-4 transition-all active:scale-[0.98]"
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.cardHov; e.currentTarget.style.borderColor = T.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.card; e.currentTarget.style.borderColor = T.border; }}
              >
                <p style={{ fontSize: '16px', color: T.white, lineHeight: '1.5', fontWeight: 400 }}>
                  {item.text}
                </p>
                <p style={{ fontSize: '13px', color: T.textDim, marginTop: '4px', fontWeight: 300 }}>
                  {item.sub}
                </p>
              </button>
            ))}
          </div>

          {/* 직접 입력 */}
          <div className="w-full">
            <div className="flex gap-2.5 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="직접 이야기해 보세요..."
                rows={1}
                className="flex-1 rounded-xl px-5 py-3.5 resize-none outline-none"
                style={{
                  background: T.bgSub,
                  border: `1px solid ${T.border}`,
                  fontSize: '15px',
                  color: T.text,
                  lineHeight: '1.6',
                  minHeight: '48px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = T.accent; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold disabled:opacity-20 transition-opacity"
                style={{ background: T.accent, color: '#fff', fontSize: '18px' }}
              >
                {"\u2191"}
              </button>
            </div>
          </div>

          <p className="mt-8 mb-6 text-center" style={{ fontSize: '12px', color: T.textDim, lineHeight: '1.7' }}>
            AI 파트너와의 대화는 저장되지 않습니다. 무료입니다.
          </p>
        </div>
      </div>
    );
  }

  /* ════════════════════ 대화 화면 ════════════════════ */
  return (
    <div className="h-screen flex flex-col" style={{ background: T.bg, color: T.text }}>
      {/* 헤더 */}
      <div className="shrink-0 px-5 py-3.5" style={{ background: T.bgSub, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.accentBg }}>
              <span style={{ fontSize: '14px', color: T.accent }}>P</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: T.white, fontWeight: 500, lineHeight: '1.3' }}>
                AI Partner
              </p>
              <p style={{ fontSize: '11px', color: T.textDim, fontWeight: 300 }}>
                {streaming ? '답변 중...' : '사장님의 이야기를 듣고 있어요'}
              </p>
            </div>
          </div>
          <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: T.textDim }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.card; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {"\u2715"}
          </Link>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="rounded-2xl px-5 py-4"
                style={{
                  maxWidth: '82%',
                  fontSize: '15px',
                  lineHeight: '1.85',
                  letterSpacing: '0.01em',
                  fontWeight: 300,
                  ...(msg.role === 'user'
                    ? {
                        background: T.userBg,
                        color: T.white,
                        borderBottomRightRadius: '6px',
                      }
                    : {
                        background: T.card,
                        color: T.text,
                        borderBottomLeftRadius: '6px',
                      }),
                }}
              >
                {msg.text || (streaming && i === messages.length - 1 ? (
                  <span className="inline-flex gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: T.textDim, animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: T.textDim, animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: T.textDim, animationDelay: '300ms' }} />
                  </span>
                ) : null)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="shrink-0 px-5 py-3.5" style={{ background: T.bgSub, borderTop: `1px solid ${T.border}` }}>
        <div className="max-w-xl mx-auto flex gap-2.5 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="편하게 말씀하세요..."
            rows={1}
            disabled={streaming}
            className="flex-1 rounded-xl px-5 py-3 resize-none disabled:opacity-40 outline-none"
            style={{
              background: T.bg,
              border: `1px solid ${T.border}`,
              fontSize: '15px',
              color: T.text,
              lineHeight: '1.6',
              minHeight: '46px',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.accent; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold disabled:opacity-20 transition-opacity"
            style={{ background: T.accent, color: '#fff', fontSize: '17px' }}
          >
            {"\u2191"}
          </button>
        </div>
      </div>
    </div>
  );
}
