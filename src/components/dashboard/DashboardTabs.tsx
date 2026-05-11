'use client';

import { useState } from 'react';
import { Lead } from '@/lib/types';
import { LeadList } from './LeadList';
import { AnalyticsPanel } from './AnalyticsPanel';
import { LayoutList, BarChart3 } from 'lucide-react';

interface DashboardTabsProps {
  clientId: string;
  leads: Lead[];
}

export function DashboardTabs({ clientId, leads }: DashboardTabsProps) {
  const [tab, setTab] = useState<'leads' | 'analytics'>('leads');

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-[var(--color-elevated)] rounded-xl p-1">
        <button
          onClick={() => setTab('leads')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'leads'
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          Leads
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'analytics'
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {tab === 'leads' ? (
        <LeadList clientId={clientId} initialLeads={leads} />
      ) : (
        <AnalyticsPanel leads={leads} />
      )}
    </div>
  );
}
