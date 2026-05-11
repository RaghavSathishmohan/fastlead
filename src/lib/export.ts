import { Lead } from './types';

export function exportLeadsToCSV(leads: Lead[]): string {
  const headers = ['Name', 'Phone', 'Email', 'Service', 'City', 'Urgency', 'Status', 'Date'];
  const rows = leads.map((lead) => [
    lead.name,
    lead.phone || '',
    lead.email || '',
    lead.service,
    lead.city || '',
    lead.urgency,
    lead.status,
    new Date(lead.created_at).toLocaleDateString(),
  ]);

  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
