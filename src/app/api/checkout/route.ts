import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getStripePriceId } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials');
  }
  return createClient(supabaseUrl, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const limit = rateLimit(`checkout:${ip}`, { maxRequests: 10, windowMs: 60000 });

    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const token = body.token as string;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadfast.raghavsathishmohan.com';
    const successUrl = `${appUrl}/d/${client.token}?success=1`;
    const cancelUrl = `${appUrl}/?canceled=1`;

    const session = await getStripe().checkout.sessions.create({
      customer_email: client.owner_email,
      line_items: [
        {
          price: getStripePriceId(),
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        client_id: client.id,
        token: client.token
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    Sentry.captureException(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
