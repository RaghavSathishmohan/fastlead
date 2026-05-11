'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  isSafariIOS: boolean;
  error: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
  return isIOS && isSafari;
}

function isStandalonePWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function usePushNotifications(token: string): {
  state: PushSubscriptionState;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
} {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    isSafariIOS: false,
    error: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setState((s) => ({ ...s, isSupported: false, isLoading: false }));
      return;
    }

    const safariIOS = isIOSSafari();
    const standalone = isStandalonePWA();

    // iOS Safari only supports push in standalone PWA mode
    if (safariIOS && !standalone) {
      setState({
        isSupported: false,
        isSubscribed: false,
        isLoading: false,
        isSafariIOS: true,
        error: null,
      });
      return;
    }

    if (!('PushManager' in window)) {
      setState((s) => ({ ...s, isSupported: false, isLoading: false }));
      return;
    }

    let cancelled = false;

    async function checkSubscription() {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();

        if (cancelled) return;

        setState({
          isSupported: true,
          isSubscribed: !!existingSub,
          isLoading: false,
          isSafariIOS: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          isSupported: true,
          isLoading: false,
          isSafariIOS: false,
          error: err instanceof Error ? err.message : 'Failed to check subscription',
        }));
      }
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const subscribe = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;

      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured');
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as unknown as ArrayBuffer,
        });
      }

      const subscriptionJson = sub.toJSON();
      if (!subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
        throw new Error('Invalid subscription keys');
      }

      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          subscription: {
            endpoint: sub.endpoint,
            keys: {
              p256dh: subscriptionJson.keys.p256dh,
              auth: subscriptionJson.keys.auth,
            },
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to save subscription');
      }

      setState({
        isSupported: true,
        isSubscribed: true,
        isLoading: false,
        isSafariIOS: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to subscribe',
      }));
    }
  }, [token]);

  const unsubscribe = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();

        await fetch('/api/push-subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            endpoint: sub.endpoint,
          }),
        });
      }

      setState({
        isSupported: true,
        isSubscribed: false,
        isLoading: false,
        isSafariIOS: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to unsubscribe',
      }));
    }
  }, [token]);

  return { state, subscribe, unsubscribe };
}
