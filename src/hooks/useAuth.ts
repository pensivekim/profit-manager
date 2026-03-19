'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';

interface User {
  userId: string;
  name?: string;
  phone?: string;
  bizType?: string;
  taxType?: string;
  plan: string;
  premiumUntil?: string;
}

// 토큰 유무를 동기적으로 판단
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('profit_token');
}

function subscribeToken(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

export function useAuth() {
  const token = useSyncExternalStore(subscribeToken, getToken, () => null);
  const [user, setUser] = useState<User | null>(null);
  const [fetched, setFetched] = useState(false);

  // 토큰이 있고 아직 fetch 안 했으면 fetch
  if (token && !fetched) {
    setFetched(true);
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('unauthorized');
        return r.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('profit_token');
      });
  }

  const loading = token !== null && user === null && fetched;

  const logout = useCallback(() => {
    localStorage.removeItem('profit_token');
    localStorage.removeItem('pro_user_id');
    setUser(null);
    setFetched(false);
    window.location.href = '/';
  }, []);

  const login = useCallback((newToken: string, userId: string) => {
    localStorage.setItem('profit_token', newToken);
    localStorage.setItem('pro_user_id', userId);
  }, []);

  return { user, loading, logout, login };
}
