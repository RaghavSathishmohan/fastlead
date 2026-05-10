import { NextResponse } from 'next/server';

/**
 * Vercel Cron hits this every few days to keep Supabase alive.
 * Free tier pauses after 7 days of inactivity.
 */
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ ok: false, error: 'Missing Supabase credentials' }, { status: 500 });
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/clients?select=id&limit=1`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true, action: 'keep-alive pinged' });
    }
    return NextResponse.json({ ok: false, status: res.status }, { status: 503 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Ping failed' }, { status: 503 });
  }
}
