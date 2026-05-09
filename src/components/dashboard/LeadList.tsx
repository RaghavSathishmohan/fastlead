'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/lib/types';
import { LeadCard } from './LeadCard';
import { subscribeToLeads, getLeadsByClient } from '@/lib/supabase';
import { Bell, RefreshCw, Filter } from 'lucide-react';

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
    lost: leads.filter((l) => l.status === 'lost').length
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-500" />
          <span className="font-semibold">Leads</span>
          <span className="text-[var(--color-muted)] text-sm">({leads.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {isPolling && <RefreshCw className="w-4 h-4 text-[var(--color-muted)] animate-spin" />}
          <span className="text-xs text-[var(--color-muted)]">
            Updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'new', 'called', 'won', 'lost'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-brand-600 text-white'
                : 'bg-[var(--color-card)] text-[var(--color-muted)] hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-muted)]">
            <Filter className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No leads found</p>
            <p className="text-sm mt-1">New leads will appear here automatically</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
