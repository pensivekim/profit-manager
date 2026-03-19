'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
      <Link href="/" className="font-bold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
        {"\uD83D\uDCB0"} 경영파트너
      </Link>

      {user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="font-semibold"
            style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)' }}
          >
            {user.name || '사장'}님 {"\u25BE"}
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded-xl shadow-lg border border-border py-1 z-50"
              style={{ background: 'var(--bg-card)', minWidth: '140px' }}
            >
              <Link href="/settings" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 font-medium"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                내 설정
              </Link>
              <Link href="/history" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 font-medium"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                내 추이
              </Link>
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="block w-full text-left px-4 py-2.5 font-medium"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--danger)' }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="font-semibold px-4 py-2 rounded-lg text-white"
          style={{ fontSize: 'var(--font-size-sm)', background: 'var(--accent)' }}>
          로그인
        </Link>
      )}
    </div>
  );
}
