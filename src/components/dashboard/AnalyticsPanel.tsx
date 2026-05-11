'use client';

import { useState, useMemo } from 'react';
import { Lead } from '@/lib/types';
import {
  getLeadVolume,
  getConversionFunnel,
  getUrgencyBreakdown,
  getServiceDemand,
  getResponseTimeStats,
} from '@/lib/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { BarChart3, TrendingUp, Clock, Calendar } from 'lucide-react';

type TimeRange = '7d' | '14d' | '30d';

interface AnalyticsPanelProps {
  leads: Lead[];
}

export function AnalyticsPanel({ leads }: AnalyticsPanelProps) {
  const [range, setRange] = useState<TimeRange>('14d');
  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;

  const volume = useMemo(() => getLeadVolume(leads, days), [leads, days]);
  const funnel = useMemo(() => getConversionFunnel(leads), [leads]);
  const urgency = useMemo(() => getUrgencyBreakdown(leads), [leads]);
  const services = useMemo(() => getServiceDemand(leads), [leads]);
  const response = useMemo(() => getResponseTimeStats(leads), [leads]);

  const totalLeads = leads.length;
  const winRate = totalLeads > 0
    ? Math.round((leads.filter((l) => l.status === 'won').length / totalLeads) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-brand-500" />
          </div>
          <span className="font-semibold">Analytics</span>
        </div>
        <div className="flex gap-1 bg-[var(--color-elevated)] rounded-lg p-0.5">
          {(['7d', '14d', '30d'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                range === r
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {r === '7d' ? '7D' : r === '14d' ? '14D' : '30D'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 text-center">
          <div className="text-lg font-bold">{totalLeads}</div>
          <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">Total</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 text-center">
          <div className="text-lg font-bold text-green-400">{winRate}%</div>
          <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">Win Rate</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 text-center">
          <div className="text-lg font-bold text-brand-400">
            {response.avgHours !== null ? `${response.avgHours}h` : '—'}
          </div>
          <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">Avg Response</div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Lead Volume</span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volume} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--color-text-secondary)' }}
                itemStyle={{ color: 'var(--color-text)' }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Conversion Funnel</span>
        </div>
        <div className="space-y-2">
          {funnel.map((stage, i) => {
            const max = funnel[0]?.count || 1;
            const pct = Math.round((stage.count / max) * 100);
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
                <div className="h-2 bg-[var(--color-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-normal"
                    style={{
                      width: `${pct}%`,
                      backgroundColor:
                        i === 0 ? '#3b82f6' : i === 1 ? '#facc15' : i === 2 ? '#4ade80' : 'var(--color-text-tertiary)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Urgency</span>
          <div className="h-32">
            {urgency.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={urgency}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    stroke="none"
                  >
                    {urgency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
                No data
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3">
            {urgency.map((u) => (
              <div key={u.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }} />
                <span className="text-[10px] text-[var(--color-text-tertiary)]">{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Top Services</span>
          <div className="space-y-2">
            {services.length > 0 ? (
              services.slice(0, 5).map((s) => (
                <div key={s.service} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--color-text-secondary)] truncate max-w-[100px]">{s.service}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--color-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(s.count / services[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
                No data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
