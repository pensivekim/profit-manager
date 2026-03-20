'use client';

import { useEffect } from 'react';

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const dest = params.get('dest') || 'calc';
    const error = params.get('error');

    if (error) {
      window.location.href = `/login?error=${error}`;
      return;
    }

    if (token && userId) {
      localStorage.setItem('profit_token', token);
      localStorage.setItem('pro_user_id', userId);
      window.location.href = `/${dest}`;
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-hint)' }}>
        로그인 처리 중...
      </p>
    </div>
  );
}
