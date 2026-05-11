import { createClient } from '@supabase/supabase-js';
import { Lead, Client } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return createClient(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
}

export async function getClientByToken(token: string): Promise<Client | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) return null;
  return data as Client;
}

export async function getLeadsByClient(clientId: string): Promise<Lead[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return (data || []) as Lead[];
}

export async function updateLeadStatus(
  leadId: string,
  status: Lead['status']
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId);

  if (error) {
    console.error('Error updating lead:', error);
    return false;
  }

  return true;
}

export async function deleteLead(leadId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (error) {
    console.error('Error deleting lead:', error);
    return false;
  }

  return true;
}

export function subscribeToLeads(
  clientId: string,
  callback: (lead: Lead) => void
) {
  const supabase = getSupabase();
  const channel = supabase
    .channel(`leads-${clientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: `client_id=eq.${clientId}`
      },
      (payload) => {
        callback(payload.new as Lead);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
