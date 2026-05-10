import { NextResponse } from 'next/server';

const CHECKPOINTS = {
  supabase: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  stripe: process.env.STRIPE_SECRET_KEY,
  resend: process.env.RESEND_API_KEY,
  gemini: process.env.GOOGLE_AI_API_KEY,
};

export async function GET() {
  const status: Record<string, { ok: boolean; detail?: string }> = {};
  let allOk = true;

  // Check Supabase
  try {
    if (CHECKPOINTS.supabase) {
      const res = await fetch(`${CHECKPOINTS.supabase}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
        signal: AbortSignal.timeout(5000),
      });
      status.supabase = { ok: res.status < 500 };
    } else {
      status.supabase = { ok: false, detail: 'Missing SUPABASE_URL' };
    }
  } catch {
    status.supabase = { ok: false, detail: 'Connection timeout' };
  }

  // Check Resend
  try {
    if (CHECKPOINTS.resend) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'HEAD',
        headers: { Authorization: `Bearer ${CHECKPOINTS.resend}` },
        signal: AbortSignal.timeout(5000),
      });
      status.resend = { ok: res.status < 500 };
    } else {
      status.resend = { ok: false, detail: 'Missing RESEND_API_KEY' };
    }
  } catch {
    status.resend = { ok: false, detail: 'Connection timeout' };
  }

  // Stripe key present?
  status.stripe = { ok: !!CHECKPOINTS.stripe };

  // Gemini key present?
  status.gemini = { ok: !!CHECKPOINTS.gemini };

  for (const s of Object.values(status)) {
    if (!s.ok) allOk = false;
  }

  return NextResponse.json({ ok: allOk, checks: status }, { status: allOk ? 200 : 503 });
}
