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
