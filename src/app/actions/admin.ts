'use server';

import { createClient } from '@supabase/supabase-js';
import { Client } from '@/lib/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminPassword = process.env.ADMIN_PASSWORD;

const supabase = createClient(supabaseUrl, serviceKey);

export interface AdminResult {
  success: boolean;
  message: string;
  clients?: Client[];
}

export async function authenticateAdmin(
  _prevState: AdminResult,
  formData: FormData
): Promise<AdminResult> {
  const password = formData.get('password') as string;

  if (!adminPassword) {
    return { success: false, message: 'Admin password not configured on server.' };
  }

  if (!password || password !== adminPassword) {
    return { success: false, message: 'Incorrect password.' };
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, message: `Failed to load clients: ${error.message}` };
  }

  return {
    success: true,
    message: `${data?.length || 0} clients loaded.`,
    clients: (data || []) as Client[]
  };
}

export async function getAdminStats(password: string): Promise<{
  totalClients: number;
  activeClients: number;
  leadsThisMonth: number;
  totalLeads: number;
}> {
  if (!adminPassword || password !== adminPassword) {
    throw new Error('Unauthorized');
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { count: totalClients },
    { count: activeClients },
    { count: leadsThisMonth },
    { count: totalLeads },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalClients: totalClients || 0,
    activeClients: activeClients || 0,
    leadsThisMonth: leadsThisMonth || 0,
    totalLeads: totalLeads || 0,
  };
}

export interface ClientDetail {
  id: string;
  name: string;
  company_name: string;
  owner_email: string;
  owner_phone: string | null;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  leadCount: number;
  lastActive: string | null;
  recentLeads: Array<{
    id: string;
    name: string;
    service: string;
    status: string;
    created_at: string;
  }>;
}

export async function getClientDetail(password: string, clientId: string): Promise<ClientDetail | null> {
  if (!adminPassword || password !== adminPassword) {
    throw new Error('Unauthorized');
  }

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error || !client) return null;

  const { count: leadCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId);

  const { data: recentLeads } = await supabase
    .from('leads')
    .select('id, name, service, status, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: lastLead } = await supabase
    .from('leads')
    .select('created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    ...client,
    leadCount: leadCount || 0,
    lastActive: lastLead?.created_at || null,
    recentLeads: recentLeads || [],
  };
}

export interface ActivityItem {
  id: string;
  name: string;
  service: string;
  status: string;
  urgency: string;
  client_name: string;
  created_at: string;
}

export async function getRecentActivity(password: string, limit = 20): Promise<ActivityItem[]> {
  if (!adminPassword || password !== adminPassword) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('id, name, service, status, urgency, created_at, client_id, clients(name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((lead: Record<string, unknown>) => ({
    id: lead.id as string,
    name: (lead.name as string) || 'Unknown',
    service: (lead.service as string) || 'General',
    status: (lead.status as string) || 'new',
    urgency: (lead.urgency as string) || 'medium',
    client_name: ((lead.clients as Record<string, unknown>)?.name as string) || 'Unknown',
    created_at: lead.created_at as string,
  }));
}

export async function deleteClient(_prevState: AdminResult, formData: FormData): Promise<AdminResult> {
  const password = formData.get('password') as string;
  const clientId = formData.get('clientId') as string;

  if (!adminPassword || password !== adminPassword) {
    return { success: false, message: 'Unauthorized.' };
  }

  if (!clientId) {
    return { success: false, message: 'Client ID is required.' };
  }

  const { error } = await supabase.from('clients').delete().eq('id', clientId);

  if (error) {
    return { success: false, message: `Failed to delete: ${error.message}` };
  }

  // Re-fetch clients after delete
  const { data, error: fetchError } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    return { success: false, message: `Deleted but failed to reload: ${fetchError.message}` };
  }

  return {
    success: true,
    message: 'Client deleted.',
    clients: (data || []) as Client[]
  };
}
