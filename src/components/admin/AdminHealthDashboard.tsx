'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, AlertCircle, CheckCircle, Server, Mail, CreditCard, Brain, Bell, Workflow } from 'lucide-react';

interface HealthCheck {
  ok: boolean;
  detail?: string;
}

interface HealthData {
  ok: boolean;
  checks: Record<string, HealthCheck>;
  timestamp: string;
}

const services = [
  { key: 'supabase', label: 'Supabase Database', icon: Server },
  { key: 'resend', label: 'Resend Email', icon: Mail },
  { key: 'stripe', label: 'Stripe Payments', icon: CreditCard },
  { key: 'gemini', label: 'Gemini AI', icon: Brain },
  { key: 'vapid', label: 'Push Notifications', icon: Bell },
  { key: 'n8n', label: 'n8n Webhook', icon: Workflow },
];

export function AdminHealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number>(0);

  const fetchHealth = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json();
      setHealth(data);
      setLastRefreshed(Date.now());
    } catch {
      setError('Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(), 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const healthyCount = health
    ? Object.values(health.checks).filter((c) => c.ok).length
    : 0;
  const totalCount = services.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <span className="font-semibold">System Health</span>
            <div className="text-xs text-[var(--color-text-tertiary)]">
              {health && (
                <>
                  {healthyCount}/{totalCount} services healthy ·{' '}
                  {Date.now() - lastRefreshed < 60000
                    ? 'Checked just now'
                    : `Checked ${new Date(health.timestamp).toLocaleTimeString()}`}
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchHealth(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-elevated)] border border-[var(--color-border)] text-xs font-medium hover:border-[var(--color-border-strong)] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((svc) => {
          const check = health?.checks[svc.key];
          const isOk = check?.ok ?? false;
          const Icon = svc.icon;

          return (
            <div
              key={svc.key}
              className={`bg-[var(--color-surface)] border rounded-xl p-4 transition-all ${
                isOk ? 'border-[var(--color-border)]' : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isOk ? 'bg-green-500/15' : 'bg-red-500/15'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isOk ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{svc.label}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isOk ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">Operational</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-red-400">{check?.detail || 'Down'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 w-2 h-2 rounded-full ${
                    isOk ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
