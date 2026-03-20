'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

type Step = 'phone' | 'code';

function formatPhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function maskPhone(phone: string): string {
  const d = phone.replace(/-/g, '');
  if (d.length < 8) return phone;
  return `${d.slice(0, 3)}-****-${d.slice(7)}`;
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  const startTimer = useCallback(() => {
    setTimer(300);
    const iv = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async () => {
    const digits = phone.replace(/-/g, '');
    if (!/^01[0-9]{8,9}$/.test(digits)) {
      setError('올바른 전화번호를 입력해주세요');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('code');
        startTimer();
      } else {
        setError(data.error || '발송에 실패했습니다');
      }
    } catch {
      setError('서버 오류');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('6자리 인증번호를 입력해주세요');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/-/g, ''), code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('profit_token', data.token);
        localStorage.setItem('pro_user_id', data.userId);
        if (data.isNew) {
          window.location.href = '/settings';
        } else {
          window.location.href = '/calc';
        }
      } else {
        setError(data.error || '인증에 실패했습니다');
      }
    } catch {
      setError('서버 오류');
    } finally {
      setLoading(false);
    }
  };

  const timerStr = timer > 0 ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}` : '';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="font-semibold" style={{ color: 'var(--accent)', fontSize: 'var(--font-size-base)' }}>
            {"\u2190"} 홈
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {step === 'phone' ? (
            <div>
              <h1 className="font-bold text-center mb-2" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', lineHeight: 'var(--line-height)' }}>
                사장님, 로그인하세요
              </h1>
              <p className="text-center mb-6" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)', lineHeight: 'var(--line-height)' }}>
                간편하게 시작하세요
              </p>

              {/* 카카오 로그인 */}
              <a href="/api/auth/kakao" className="block mb-4">
                <button
                  type="button"
                  className="w-full rounded-xl font-medium hover:opacity-90 transition-opacity"
                  style={{
                    background: '#FEE500', color: '#191919', border: 'none',
                    fontSize: '16px', height: '56px', cursor: 'pointer',
                  }}
                >
                  {"\uD83D\uDCAC"} 카카오로 시작하기
                </button>
              </a>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
                <span style={{ fontSize: '13px', color: '#9A9690' }}>또는 전화번호로 로그인</span>
                <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
              </div>

              <div className="rounded-2xl p-6 border border-border" style={{ background: 'var(--bg-card)' }}>
                <label className="block font-semibold mb-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                  전화번호
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  autoFocus
                  className="w-full rounded-xl border-2 px-4 text-center font-bold outline-none"
                  style={{
                    fontSize: 'var(--font-size-xl)', height: '64px', lineHeight: '1.5',
                    borderColor: 'var(--accent)', background: 'var(--bg-card)', color: 'var(--text-primary)',
                  }}
                />
                {error && <p className="text-center mt-3" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--danger)' }}>{error}</p>}

                <button
                  onClick={handleSendCode}
                  disabled={loading || phone.replace(/-/g, '').length < 10}
                  className="w-full mt-4 rounded-xl text-white font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
                  style={{ fontSize: 'var(--font-size-lg)', height: '56px', background: 'var(--accent)' }}
                >
                  {loading ? '발송 중...' : '인증번호 받기'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-bold text-center mb-2" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', lineHeight: 'var(--line-height)' }}>
                인증번호를 입력하세요
              </h1>
              <p className="text-center mb-8" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)', lineHeight: 'var(--line-height)' }}>
                {maskPhone(phone)}로 보냈어요
                {timerStr && <span className="ml-2 font-bold" style={{ color: 'var(--accent)' }}>{timerStr}</span>}
              </p>

              <div className="rounded-2xl p-6 border border-border" style={{ background: 'var(--bg-card)' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                  className="w-full rounded-xl border-2 px-4 text-center font-bold tracking-widest outline-none"
                  style={{
                    fontSize: 'var(--font-size-2xl)', height: '72px', lineHeight: '1.3',
                    borderColor: 'var(--accent)', background: 'var(--bg-card)', color: 'var(--text-primary)',
                    letterSpacing: '0.3em',
                  }}
                />
                {error && <p className="text-center mt-3" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--danger)' }}>{error}</p>}

                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  className="w-full mt-4 rounded-xl text-white font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
                  style={{ fontSize: 'var(--font-size-lg)', height: '56px', background: 'var(--accent)' }}
                >
                  {loading ? '확인 중...' : '확인'}
                </button>

                <div className="flex justify-between mt-4">
                  <button onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                    style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)' }}>
                    {"\u2190"} 번호 변경
                  </button>
                  <button onClick={() => { setCode(''); setError(''); handleSendCode(); }}
                    disabled={loading}
                    style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)' }}>
                    재발송
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
