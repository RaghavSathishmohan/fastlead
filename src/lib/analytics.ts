import { Lead } from './types';

export interface VolumeData {
  date: string;
  count: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface UrgencyDatum {
  name: string;
  value: number;
  color: string;
}

export interface ServiceDatum {
  service: string;
  count: number;
}

export interface ResponseStats {
  avgHours: number | null;
  count: number;
}

export function getLeadVolume(leads: Lead[], days: number): VolumeData[] {
  const result: VolumeData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    result.push({ date: label, count: 0 });
  }

  for (const lead of leads) {
    const leadDate = new Date(lead.created_at);
    const label = leadDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const match = result.find((r) => r.date === label);
    if (match) match.count++;
  }

  return result;
}

export function getConversionFunnel(leads: Lead[]): FunnelStage[] {
  const total = leads.length;
  const called = leads.filter((l) => l.status === 'called' || l.status === 'won' || l.status === 'lost').length;
  const won = leads.filter((l) => l.status === 'won').length;
  const lost = leads.filter((l) => l.status === 'lost').length;

  return [
    { stage: 'New', count: total },
    { stage: 'Called', count: called },
    { stage: 'Won', count: won },
    { stage: 'Lost', count: lost },
  ];
}

export function getUrgencyBreakdown(leads: Lead[]): UrgencyDatum[] {
  const counts = {
    low: leads.filter((l) => l.urgency === 'low').length,
    medium: leads.filter((l) => l.urgency === 'medium').length,
    high: leads.filter((l) => l.urgency === 'high').length,
  };

  return [
    { name: 'Low', value: counts.low, color: 'var(--color-text-tertiary)' },
    { name: 'Medium', value: counts.medium, color: '#facc15' },
    { name: 'High', value: counts.high, color: '#f87171' },
  ].filter((d) => d.value > 0);
}

export function getServiceDemand(leads: Lead[]): ServiceDatum[] {
  const counts: Record<string, number> = {};
  for (const lead of leads) {
    const svc = lead.service || 'Unknown';
    counts[svc] = (counts[svc] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function getResponseTimeStats(leads: Lead[]): ResponseStats {
  const responded = leads.filter(
    (l) =>
      l.status !== 'new' &&
      l.created_at &&
      l.updated_at &&
      new Date(l.updated_at).getTime() > new Date(l.created_at).getTime()
  );

  if (responded.length === 0) return { avgHours: null, count: 0 };

  const totalHours = responded.reduce((sum, lead) => {
    const created = new Date(lead.created_at).getTime();
    const updated = lead.updated_at ? new Date(lead.updated_at).getTime() : created;
    return sum + (updated - created) / (1000 * 60 * 60);
  }, 0);

  return {
    avgHours: Math.round((totalHours / responded.length) * 10) / 10,
    count: responded.length,
  };
}
