'use server';

import { createClient } from '@supabase/supabase-js';
import { getStripe, getStripePriceId } from '@/lib/stripe';
import { withRetry } from '@/lib/retry';
import { rateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'alerts@leadfast.raghavsathishmohan.com';
const discountCode = process.env.DISCOUNT_CODE;

const supabase = createClient(supabaseUrl, serviceKey);

export interface SignupResult {
  success: boolean;
  message: string;
  token?: string;
  dashboardUrl?: string;
  onboardingUrl?: string;
  checkoutUrl?: string;
}

async function sendWelcomeEmail(
  name: string,
  ownerEmail: string,
  companyName: string,
  token: string
) {
  if (!resendKey) return;
  const dashboardUrl = `https://app.leadfast.raghavsathishmohan.com/d/${token}`;
  try {
    await withRetry(async () => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `LeadFast <${fromEmail}>`,
          to: ownerEmail,
          subject: 'Your LeadFast Dashboard is Ready',
          html: `<p>Hi ${name},</p>
<p>Your LeadFast account for <strong>${companyName}</strong> is now active.</p>
<p><a href="${dashboardUrl}" style="color:#d97706;font-weight:bold;">Open Your Dashboard</a></p>
<p>Save this link — it is your private portal to view and manage every lead.</p>
<p><em>This email is not monitored. Questions? Reach out to Raghav Sathishmohan at raghavsathishmohan@gmail.com or +1 732-447-6474.</em></p>`
        })
      });
      if (!res.ok) throw new Error(`Resend ${res.status}`);
    }, { retries: 3, delay: 500 });
  } catch {
    Sentry.captureMessage('Welcome email failed after retries');
  }
}

export async function signupClient(
  _prevState: SignupResult,
  formData: FormData
): Promise<SignupResult> {
  const email = formData.get('email') as string;
  const limit = rateLimit(`signup:${email}`, { maxRequests: 5, windowMs: 600000 });

  if (!limit.success) {
    return { success: false, message: 'Too many signup attempts. Please try again later.' };
  }

  const name = formData.get('name') as string;
  const owner_email = formData.get('email') as string;
  const owner_phone = formData.get('phone') as string;
  const company_name = formData.get('company') as string;
  const code = (formData.get('discount_code') as string)?.trim();

  const hasValidDiscount = !!discountCode && code && code === discountCode;

  if (!name || !owner_email || !company_name) {
    return { success: false, message: 'Name, email, and company are required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(owner_email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .eq('owner_email', owner_email)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'active') {
      return {
        success: false,
        message: `An account already exists for ${owner_email}.`,
        dashboardUrl: `https://app.leadfast.raghavsathishmohan.com/d/${existing.token}`
      };
    }

    if (hasValidDiscount) {
      await supabase.from('clients').update({ status: 'active' }).eq('id', existing.id);
      await sendWelcomeEmail(existing.name, existing.owner_email, existing.company_name, existing.token);
      return {
        success: true,
        message: 'Account activated with discount code! Check your email.',
        onboardingUrl: `https://app.leadfast.raghavsathishmohan.com/onboarding/${existing.token}`,
        token: existing.token
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadfast.raghavsathishmohan.com';
    const session = await getStripe().checkout.sessions.create({
      customer_email: existing.owner_email,
      line_items: [{ price: getStripePriceId(), quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/d/${existing.token}?success=1`,
      cancel_url: `${appUrl}/?canceled=1`,
      metadata: { client_id: existing.id, token: existing.token }
    });

    return {
      success: true,
      message: 'Complete your payment to activate your account.',
      checkoutUrl: session.url ?? undefined,
      token: existing.token
    };
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name,
      owner_email,
      owner_phone: owner_phone || null,
      company_name,
      status: hasValidDiscount ? 'active' : 'pending'
    })
    .select()
    .single();

  if (error || !client) {
    return { success: false, message: `Failed to create account: ${error?.message || 'Unknown error'}` };
  }

  if (hasValidDiscount) {
    await sendWelcomeEmail(client.name, client.owner_email, client.company_name, client.token);
    return {
      success: true,
      message: 'Account activated with discount code! Check your email for your dashboard link.',
      token: client.token,
      onboardingUrl: `https://app.leadfast.raghavsathishmohan.com/onboarding/${client.token}`
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadfast.raghavsathishmohan.com';
  const session = await getStripe().checkout.sessions.create({
    customer_email: client.owner_email,
    line_items: [{ price: getStripePriceId(), quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/d/${client.token}?success=1`,
    cancel_url: `${appUrl}/?canceled=1`,
    metadata: { client_id: client.id, token: client.token }
  });

  return {
    success: true,
    message: 'Account created! Complete your payment to activate.',
    token: client.token,
    checkoutUrl: session.url ?? undefined
  };
}