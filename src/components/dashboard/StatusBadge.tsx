'use client';

import { LeadStatus, LeadUrgency } from '@/lib/types';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  called: { label: 'Called', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  won: { label: 'Won', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  lost: { label: 'Lost', className: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' }
};

const urgencyConfig: Record<LeadUrgency, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-neutral-400' },
  medium: { label: 'Medium', className: 'text-yellow-400' },
  high: { label: 'High', className: 'text-red-400' }
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: LeadUrgency }) {
  const config = urgencyConfig[urgency];
  return (
    <span className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
