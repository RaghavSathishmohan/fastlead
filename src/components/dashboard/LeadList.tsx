'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/lib/types';
import { LeadCard } from './LeadCard';
import { subscribeToLeads, getLeadsByClient } from '@/lib/supabase';
import { Bell, RefreshCw, Filter } from 'lucide-react';
import { ExportButton } from './ExportButton';

interface LeadListProps {
  clientId: string;
  initialLeads: Lead[];
}

type FilterStatus = 'all' | Lead['status'];

export function LeadList({ clientId, initialLeads }: LeadListProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const handleRealtimeUpdate = useCallback((updatedLead: Lead) => {
    setLeads((current) => {
      const exists = current.find((l) => l.id === updatedLead.id);
      if (exists) {
        return current.map((l) => (l.id === updatedLead.id ? updatedLead : l));
      }
      return [updatedLead, ...current];
    });
    setLastUpdate(Date.now());
  }, []);

  const handleStatusChange = useCallback((leadId: string, status: Lead['status']) => {
    setLeads((current) =>
      current.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  }, []);

  const handleDelete = useCallback((leadId: string) => {
    setLeads((current) => current.filter((l) => l.id !== leadId));
  }, []);

  const handleNotesUpdate = useCallback((leadId: string, notes: string | null) => {
    setLeads((current) =>
      current.map((l) => (l.id === leadId ? { ...l, notes } : l))
    );
  }, []);

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = subscribeToLeads(clientId, handleRealtimeUpdate);
    return unsubscribe;
  }, [clientId, handleRealtimeUpdate]);

  // Polling fallback for older browsers
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsPolling(true);
      const fresh = await getLeadsByClient(clientId);
      setLeads(fresh);
      setIsPolling(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [clientId]);

  const filteredLeads = filter === 'all'
    ? leads
    : leads.filter((l) => l.status === filter);

  const statusCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    called: leads.filter((l) => l.status === 'called').length,
    won: leads.filter((l) => l.status === 'won').length,
    lost: leads.filter((l) => l.status === 'lost').length,
    duplicate: leads.filter((l) => l.status === 'duplicate').length
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
            <Bell className="w-4 h-4 text-brand-500" />
          </div>
          <span className="font-semibold">Leads</span>
          <span className="text-[var(--color-text-secondary)] text-sm">({leads.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {isPolling && <RefreshCw className="w-4 h-4 text-[var(--color-text-tertiary)] animate-spin" />}
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
          {(['all', 'new', 'called', 'won', 'lost', 'duplicate'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-fast ${
              filter === status
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">{statusCounts[status]}</span>
          </button>
        ))}
        </div>
        <ExportButton leads={leads} filter={filter === 'all' ? 'all' : filter} />
      </div>

      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-14 text-[var(--color-text-secondary)]">
            <div className="w-14 h-14 bg-[var(--color-elevated)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-6 h-6 opacity-40" />
            </div>
            <p className="font-medium">No leads found</p>
            <p className="text-sm mt-1">New leads will appear here automatically</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onNotesUpdate={handleNotesUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
