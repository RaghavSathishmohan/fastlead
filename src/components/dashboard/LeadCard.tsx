'use client';

import { Lead } from '@/lib/types';
import { StatusBadge, UrgencyBadge } from './StatusBadge';
import { Phone, Mail, MapPin, Wrench, Clock, CheckCircle, XCircle, PhoneCall } from 'lucide-react';
import { updateLeadStatus } from '@/lib/supabase';
import { useState } from 'react';

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: string, status: Lead['status']) => void;
}

export function LeadCard({ lead, onStatusChange }: LeadCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: Lead['status']) => {
    if (isUpdating || lead.status === status) return;
    setIsUpdating(true);
    const success = await updateLeadStatus(lead.id, status);
    if (success) {
      onStatusChange(lead.id, status);
    }
    setIsUpdating(false);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <article className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{lead.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={lead.status} />
            <UrgencyBadge urgency={lead.urgency} />
          </div>
        </div>
        <div className="flex items-center text-[var(--color-muted)] text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {timeAgo(lead.created_at)}
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        {lead.service && (
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <Wrench className="w-4 h-4 shrink-0" />
            <span>{lead.service}</span>
          </div>
        )}
        {lead.city && (
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{lead.city}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        )}
        <button
          onClick={() => handleStatusChange('called')}
          disabled={isUpdating || lead.status === 'called'}
          className="flex items-center justify-center p-2.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] transition-colors disabled:opacity-50"
          aria-label="Mark as called"
        >
          <PhoneCall className="w-4 h-4 text-yellow-400" />
        </button>
        <button
          onClick={() => handleStatusChange('won')}
          disabled={isUpdating || lead.status === 'won'}
          className="flex items-center justify-center p-2.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] transition-colors disabled:opacity-50"
          aria-label="Mark as won"
        >
          <CheckCircle className="w-4 h-4 text-green-400" />
        </button>
        <button
          onClick={() => handleStatusChange('lost')}
          disabled={isUpdating || lead.status === 'lost'}
          className="flex items-center justify-center p-2.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] transition-colors disabled:opacity-50"
          aria-label="Mark as lost"
        >
          <XCircle className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </article>
  );
}
