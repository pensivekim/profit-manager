'use client';

import Link from 'next/link';

export default function LoginPage() {
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
          <div className="text-center">
            <p className="text-5xl mb-4">{"\uD83D\uDD25"}</p>
            <h1 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', lineHeight: 'var(--line-height)' }}>
              사장님, 시작하세요
            </h1>
            <p className="mb-8" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-hint)', lineHeight: 'var(--line-height)' }}>
              카카오 계정으로 간편하게 시작하세요
            </p>

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
