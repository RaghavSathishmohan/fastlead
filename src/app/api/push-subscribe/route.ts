import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface PushSubscriptionBody {
  token: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PushSubscriptionBody;
    const { token, subscription } = body;

    if (!token || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('token', token)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          client_id: client.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: req.headers.get('user-agent') || null,
        },
        { onConflict: 'client_id,endpoint' }
      );

    if (upsertError) {
      return NextResponse.json({ error: `Failed to save subscription: ${upsertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { token: string; endpoint: string };
    const { token, endpoint } = body;

    if (!token || !endpoint) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('token', token)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('client_id', client.id)
      .eq('endpoint', endpoint);

    if (deleteError) {
      return NextResponse.json({ error: `Failed to delete subscription: ${deleteError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
