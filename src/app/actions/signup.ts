'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'alerts@leadfast.raghavsathishmohan.com';

const supabase = createClient(supabaseUrl, serviceKey);

export interface SignupResult {
  success: boolean;
  message: string;
  token?: string;
  dashboardUrl?: string;
}

export async function signupClient(
  _prevState: SignupResult,
  formData: FormData
): Promise<SignupResult> {
  const name = formData.get('name') as string;
  const owner_email = formData.get('email') as string;
  const owner_phone = formData.get('phone') as string;
  const company_name = formData.get('company') as string;

  if (!name || !owner_email || !company_name) {
    return { success: false, message: 'Name, email, and company are required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(owner_email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name,
      owner_email,
      owner_phone: owner_phone || null,
      company_name,
      status: 'active'
    })
    .select()
    .single();

  if (error || !client) {
    return { success: false, message: `Failed to create account: ${error?.message || 'Unknown error'}` };
  }

  const dashboardUrl = `https://app.leadfast.raghavsathishmohan.com/d/${client.token}`;

  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `LeadFast <${fromEmail}>`,
          to: owner_email,
          subject: 'Your LeadFast Dashboard is Ready',
          html: `<p>Hi ${name},</p>
<p>Your LeadFast account for <strong>${company_name}</strong> is live.</p>
<p><a href="${dashboardUrl}" style="color:#ef4444;font-weight:bold;">Open Your Dashboard</a></p>
<p>Save this link — it is your private portal to view and manage every lead.</p>
<p>Questions? Reply to this email.</p>`
        })
      });
    } catch {
      // Non-blocking
    }
  }

  return {
    success: true,
    message: 'Account created! Check your email for your dashboard link.',
    token: client.token,
    dashboardUrl
  };
}
