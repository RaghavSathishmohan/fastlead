'use client';

import { useState } from 'react';
import { CreditCard, Lock, Zap } from 'lucide-react';

interface PaymentGateProps {
  token: string;
  status: 'pending' | 'paused';
}

export function PaymentGate({ token, status }: PaymentGateProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPaused = status === 'paused';

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 space-y-7">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-brand-500/15 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-brand-500" />
        </div>
        <h2 className="text-xl font-bold">
          {isPaused ? 'Subscription Expired' : 'Activate Your Account'}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
          {isPaused
            ? 'Your subscription has ended. Reactivate to continue receiving leads.'
            : 'Complete your subscription to start capturing and managing leads.'}
        </p>
      </div>

      <div className="space-y-4 bg-[var(--color-elevated)] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <span className="text-sm font-medium">LeadFast Subscription</span>
          <span className="text-sm font-bold">$197/mo</span>
        </div>
        <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
          {[
            'Unlimited leads',
            'Instant AI auto-reply',
            'Email alerts + live dashboard'
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-brand-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3.5 font-semibold transition-all duration-normal hover:shadow-glow disabled:cursor-not-allowed"
      >
        <CreditCard className="w-4 h-4" />
        {isLoading ? 'Loading...' : isPaused ? 'Reactivate for $197/mo' : 'Subscribe for $197/mo'}
      </button>

      <p className="text-center text-xs text-[var(--color-text-tertiary)]">
        Secured by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
