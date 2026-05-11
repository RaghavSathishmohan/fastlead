'use client';

import { Users, Activity, Zap, Mail } from 'lucide-react';

interface StatsCardsProps {
  totalClients: number;
  activeClients: number;
  leadsThisMonth: number;
  totalLeads: number;
}

export function StatsCards({ totalClients, activeClients, leadsThisMonth, totalLeads }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Clients',
      value: totalClients,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15',
    },
    {
      label: 'Active Clients',
      value: activeClients,
      icon: Zap,
      color: 'text-green-400',
      bg: 'bg-green-500/15',
    },
    {
      label: 'Leads This Month',
      value: leadsThisMonth,
      icon: Mail,
      color: 'text-brand-400',
      bg: 'bg-brand-500/15',
    },
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Activity,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3"
        >
          <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <div>
            <div className="text-xl font-bold">{card.value.toLocaleString()}</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
