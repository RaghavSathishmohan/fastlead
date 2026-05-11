'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, Loader2, Smartphone, AlertCircle } from 'lucide-react';

interface PushNotificationToggleProps {
  token: string;
}

export function PushNotificationToggle({ token }: PushNotificationToggleProps) {
  const { state, subscribe, unsubscribe } = usePushNotifications(token);

  if (state.isSafariIOS) {
    return (
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-400">Add to Home Screen for push alerts</p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Safari on iPhone requires this page to be installed as an app. Tap the share button in Safari, then "Add to Home Screen." Open the app icon and enable push alerts there.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isSupported) {
    return (
      <div className="text-xs text-[var(--color-text-secondary)] inline-flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3" />
        Push notifications not supported on this browser
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking push status...
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="space-y-2">
        <button
          onClick={subscribe}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-xs font-medium transition-all"
        >
          <Bell className="w-3 h-3" />
          Enable push alerts
        </button>
        <p className="text-xs text-red-400">{state.error}</p>
      </div>
    );
  }

  if (state.isSubscribed) {
    return (
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          Push alerts on
        </span>
        <button
          onClick={unsubscribe}
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors inline-flex items-center gap-1"
        >
          <BellOff className="w-3 h-3" />
          Turn off
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={state.isLoading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-xs font-medium transition-all"
    >
      <Bell className="w-3 h-3" />
      Enable push alerts
    </button>
  );
}
