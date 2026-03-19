'use client';

import { useEffect } from 'react';
import { registerSW, subscribePush } from '@/lib/push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export default function PWAInit() {
  useEffect(() => {
    async function init() {
      const reg = await registerSW();
      if (!reg || !VAPID_PUBLIC_KEY) return;

      // Wait for SW to be ready
      await navigator.serviceWorker.ready;

      const userId = localStorage.getItem('pro_user_id') || '';
      if (userId && 'PushManager' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await subscribePush(reg, VAPID_PUBLIC_KEY, userId);
        }
      }
    }
    init();
  }, []);

  return null;
}
