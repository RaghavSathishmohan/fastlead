import { notFound } from 'next/navigation';
import { getClientByToken, getLeadsByClient } from '@/lib/supabase';
import { LeadList } from '@/components/dashboard/LeadList';
import { Phone, Mail, Building2, Zap } from 'lucide-react';

export const revalidate = 0;

interface DashboardPageProps {
  params: { token: string };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const client = await getClientByToken(params.token);

  if (!client) {
    notFound();
  }

  const leads = await getLeadsByClient(client.id);

  return (
    <div className="min-h-dvh max-w-lg mx-auto px-4 py-6 space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-500" />
          <h1 className="text-lg font-bold">{client.company_name}</h1>
        </div>
        <p className="text-sm text-[var(--color-muted)]">Lead Dashboard</p>
      </header>

      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wide">
          Contact Info
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--color-muted)]" />
            <span>{client.name}</span>
          </div>
          {client.owner_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--color-muted)]" />
              <a href={`tel:${client.owner_phone}`} className="hover:text-brand-400 transition-colors">
                {client.owner_phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--color-muted)]" />
            <span>{client.owner_email}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {client.alert_email && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium">
              Email alerts on
            </span>
          )}
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-brand-500/20 text-brand-400 text-xs font-medium">
            Live updates
          </span>
        </div>
      </section>

      <LeadList clientId={client.id} initialLeads={leads} />
    </div>
  );
}
