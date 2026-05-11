import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { PaymentGate } from '@/components/dashboard/PaymentGate';
import { PushNotificationToggle } from '@/components/dashboard/PushNotificationToggle';
import { ServiceWorkerRegister } from '@/components/dashboard/ServiceWorkerRegister';
import { Phone, Mail, Building2 } from 'lucide-react';
import { Client, Lead } from '@/lib/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const revalidate = 0;

interface DashboardPageProps {
  params: { token: string };
}

async function getClientByToken(token: string): Promise<Client | null> {
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) return null;
  return data as Client;
}

async function getLeadsByClient(clientId: string): Promise<Lead[]> {
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return (data || []) as Lead[];
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const client = await getClientByToken(params.token);

  if (!client) {
    notFound();
  }

  if (client.status !== 'active') {
    return (
      <div className="min-h-dvh max-w-lg mx-auto px-4 py-6">
        <header className="flex items-center gap-2.5 mb-8">
          <img src="/logo-icon.svg" alt="" className="w-8 h-8" />
          <h1 className="text-lg font-bold tracking-tight">LeadFast</h1>
        </header>
        <PaymentGate token={client.token} status={client.status} />
      </div>
    );
  }

  const leads = await getLeadsByClient(client.id);

  return (
    <div className="min-h-dvh max-w-lg mx-auto px-4 py-6 space-y-6">
      <ServiceWorkerRegister />
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <img src="/logo-icon.svg" alt="" className="w-8 h-8" />
          <h1 className="text-lg font-bold tracking-tight">{client.company_name}</h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] ml-10.5">Lead Dashboard</p>
      </header>

      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          Contact Info
        </h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--color-elevated)] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </div>
            <span>{client.name}</span>
          </div>
          {client.owner_phone && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[var(--color-elevated)] flex items-center justify-center">
                <Phone className="w-4 h-4 text-[var(--color-text-secondary)]" />
              </div>
              <a href={`tel:${client.owner_phone}`} className="hover:text-brand-400 transition-colors">
                {client.owner_phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--color-elevated)] flex items-center justify-center">
              <Mail className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </div>
            <span className="text-[var(--color-text-secondary)]">{client.owner_email}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {client.alert_email && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              Email alerts on
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-400 text-xs font-medium border border-brand-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-500" />
            </span>
            Live updates
          </span>
        </div>

        <PushNotificationToggle token={client.token} />
      </section>

      <DashboardTabs clientId={client.id} leads={leads} />
    </div>
  );
}
