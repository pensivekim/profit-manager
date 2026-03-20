'use client';

import { useMemo } from 'react';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
  no_code: '카카오 인증 코드를 받지 못했습니다.',
  config: '서버 설정 오류입니다. 관리자에게 문의하세요.',
  token: '카카오 인증에 실패했습니다. 다시 시도해주세요.',
  user_info: '카카오 사용자 정보를 가져오지 못했습니다.',
  db: '서버 DB 오류입니다. 잠시 후 다시 시도해주세요.',
  server: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

export default function LoginPage() {
  const { error, detail } = useMemo(() => {
    if (typeof window === 'undefined') return { error: '', detail: '' };
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    return {
      error: err ? (ERROR_MESSAGES[err] || '로그인 중 오류가 발생했습니다.') : '',
      detail: params.get('detail') || '',
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-lg mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="flex items-center mb-8">
          <Link href="/" className="font-semibold" style={{ color: 'var(--accent)', fontSize: 'var(--font-size-base)' }}>
            {"\u2190"} 홈
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">{"\uD83D\uDD25"}</p>
            <h1 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', lineHeight: 'var(--line-height)' }}>
              사장님, 시작하세요
            </h1>
            <p className="mb-8" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)', lineHeight: 'var(--line-height)' }}>
              카카오 계정으로 간편하게 시작하세요
            </p>

            {error && (
              <div className="rounded-xl p-4 mb-4 text-left" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="font-semibold text-red-600" style={{ fontSize: '14px' }}>{error}</p>
                {detail && <p className="mt-1 text-red-400" style={{ fontSize: '12px' }}>{detail}</p>}
              </div>
            )}

            <a href="/api/auth/kakao" className="block">
              <button
                type="button"
                className="w-full rounded-xl font-bold hover:opacity-90 transition-opacity"
                style={{
                  background: '#FEE500', color: '#191919', border: 'none',
                  fontSize: '18px', height: '56px', cursor: 'pointer',
                }}
              >
                {"\uD83D\uDCAC"} 카카오로 시작하기
              </button>
            </a>

            <p className="mt-4" style={{ fontSize: '13px', color: '#9A9690' }}>
              가입 30초 · 완전 무료
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
