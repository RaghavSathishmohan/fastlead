'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

interface OnboardClientInput {
  name: string;
  owner_email: string;
  owner_phone?: string;
  company_name: string;
}

export async function onboardClient(input: OnboardClientInput) {
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name: input.name,
      owner_email: input.owner_email,
      owner_phone: input.owner_phone || null,
      company_name: input.company_name
    })
    .select()
    .single();

  if (error || !client) {
    throw new Error(`Failed to create client: ${error?.message}`);
  }

  return {
    token: client.token,
    dashboardUrl: `https://app.leadfast.raghavsathishmohan.com/d/${client.token}`,
    webhookUrl: `https://n8n.leadfast.raghavsathishmohan.com/webhook/lead-capture`,
    clientId: client.id
  };
}
