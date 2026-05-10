import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'alerts@leadfast.raghavsathishmohan.com';

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials');
  }
  return createClient(supabaseUrl, serviceKey);
}

async function sendWelcomeEmail(
  name: string,
  ownerEmail: string,
  companyName: string,
  dashboardUrl: string
) {
  if (!resendKey) return;

  try {
    await fetch('https://api.resend.com/emails', {
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
<p><a href="${dashboardUrl}" style="color:#ef4444;font-weight:bold;">Open Your Dashboard</a></p>
<p>Save this link — it is your private portal to view and manage every lead.</p>
<p><em>This email is not monitored. Questions? Reach out to Raghav Sathishmohan at raghavsathishmohan@gmail.com or +1 732-447-6474.</em></p>`
      })
    });
  } catch {
    // Non-blocking
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const clientId = session.metadata?.client_id;
      const token = session.metadata?.token;

      if (!clientId || !token) {
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

      await supabase
        .from('clients')
        .update({
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId
        })
        .eq('id', clientId);

      const dashboardUrl = `https://app.leadfast.raghavsathishmohan.com/d/${token}`;
      await sendWelcomeEmail(client.name, client.owner_email, client.company_name, dashboardUrl);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('stripe_subscription_id', subscription.id);

      if (clients && clients.length > 0) {
        for (const client of clients) {
          await supabase.from('clients').update({ status: 'paused' }).eq('id', client.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
