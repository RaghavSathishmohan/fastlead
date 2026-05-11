'use client';

import { Lead } from '@/lib/types';
import { exportLeadsToCSV, downloadCSV } from '@/lib/export';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  leads: Lead[];
  filter?: Lead['status'] | 'all';
}

export function ExportButton({ leads, filter = 'all' }: ExportButtonProps) {
  const handleExport = () => {
    const toExport = filter === 'all' ? leads : leads.filter((l) => l.status === filter);
    if (toExport.length === 0) return;

    const csv = exportLeadsToCSV(toExport);
    const filename = `leads-${filter}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-xs font-medium transition-all"
    >
      <Download className="w-3 h-3" />
      Export CSV
    </button>
  );
}
