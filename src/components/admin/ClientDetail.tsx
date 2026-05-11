'use client';

import { ClientDetail as ClientDetailType } from '@/app/actions/admin';
import { X, Building2, Mail, Phone, Calendar, BarChart3, Clock } from 'lucide-react';

interface ClientDetailProps {
  client: ClientDetailType;
  onClose: () => void;
}

export function ClientDetail({ client, onClose }: ClientDetailProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-500/15 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    paused: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  const timeAgo = (date: string | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-semibold">{client.company_name}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[client.status] || statusColors.pending}`}
              >
                {client.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <div className="px-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-elevated)] rounded-lg p-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider">Leads</span>
              </div>
              <div className="text-lg font-bold">{client.leadCount}</div>
            </div>
            <div className="bg-[var(--color-elevated)] rounded-lg p-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider">Last Active</span>
              </div>
              <div className="text-lg font-bold">{timeAgo(client.lastActive)}</div>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              <span>{client.owner_email}</span>
            </div>
            {client.owner_phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                <span>{client.owner_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              <span>Joined {new Date(client.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {client.stripe_subscription_id && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              Subscribed
            </div>
          )}
        </div>

        {client.recentLeads.length > 0 && (
          <div className="px-5 pb-5">
            <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              Recent Leads
            </h4>
            <div className="space-y-2">
              {client.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between bg-[var(--color-elevated)] rounded-lg px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{lead.name || 'Unknown'}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">{lead.service}</div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      lead.status === 'new'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                        : lead.status === 'won'
                          ? 'bg-green-500/15 text-green-400 border-green-500/20'
                          : lead.status === 'called'
                            ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                            : lead.status === 'duplicate'
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                              : 'bg-red-500/15 text-red-400 border-red-500/20'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
