import { NextResponse } from 'next/server';
import webpush from 'web-push';

const CHECKPOINTS = {
  supabase: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  stripe: process.env.STRIPE_SECRET_KEY,
  resend: process.env.RESEND_API_KEY,
  gemini: process.env.GOOGLE_AI_API_KEY,
  vapidPublic: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  vapidPrivate: process.env.VAPID_PRIVATE_KEY,
  n8n: process.env.NEXT_PUBLIC_APP_URL,
};

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};
  let allOk = true;

  // Check Supabase
  try {
    if (CHECKPOINTS.supabase) {
      const res = await fetch(`${CHECKPOINTS.supabase}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
        signal: AbortSignal.timeout(5000),
      });
      checks.supabase = { ok: res.status < 500 };
    } else {
      checks.supabase = { ok: false, detail: 'Missing SUPABASE_URL' };
    }
  } catch {
    checks.supabase = { ok: false, detail: 'Connection timeout' };
  }

  // Check Resend
  try {
    if (CHECKPOINTS.resend) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'HEAD',
        headers: { Authorization: `Bearer ${CHECKPOINTS.resend}` },
        signal: AbortSignal.timeout(5000),
      });
      checks.resend = { ok: res.status < 500 };
    } else {
      checks.resend = { ok: false, detail: 'Missing RESEND_API_KEY' };
    }
  } catch {
    checks.resend = { ok: false, detail: 'Connection timeout' };
  }

  // Check Stripe (lightweight API check)
  try {
    if (CHECKPOINTS.stripe) {
      const res = await fetch('https://api.stripe.com/v1/account', {
        headers: { Authorization: `Bearer ${CHECKPOINTS.stripe}` },
        signal: AbortSignal.timeout(5000),
      });
      checks.stripe = { ok: res.status === 200 };
      if (!checks.stripe.ok) {
        checks.stripe.detail = res.status === 401 ? 'Invalid API key' : `HTTP ${res.status}`;
      }
    } else {
      checks.stripe = { ok: false, detail: 'Missing STRIPE_SECRET_KEY' };
    }
  } catch {
    checks.stripe = { ok: false, detail: 'Connection timeout' };
  }

  // Check Gemini (lightweight API check)
  try {
    if (CHECKPOINTS.gemini) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${CHECKPOINTS.gemini}`,
        { signal: AbortSignal.timeout(5000) }
      );
      checks.gemini = { ok: res.status === 200 };
      if (!checks.gemini.ok) {
        checks.gemini.detail = res.status === 400 ? 'Invalid API key' : `HTTP ${res.status}`;
      }
    } else {
      checks.gemini = { ok: false, detail: 'Missing GOOGLE_AI_API_KEY' };
    }
  } catch {
    checks.gemini = { ok: false, detail: 'Connection timeout' };
  }

  // Check VAPID keys
  try {
    if (CHECKPOINTS.vapidPublic && CHECKPOINTS.vapidPrivate) {
      webpush.setVapidDetails(
        'mailto:admin@leadfast.raghavsathishmohan.com',
        CHECKPOINTS.vapidPublic,
        CHECKPOINTS.vapidPrivate
      );
      checks.vapid = { ok: true };
    } else {
      checks.vapid = { ok: false, detail: 'Missing VAPID keys' };
    }
  } catch {
    checks.vapid = { ok: false, detail: 'Invalid VAPID key format' };
  }

  // Check n8n webhook endpoint
  try {
    if (CHECKPOINTS.n8n) {
      const webhookUrl = `${CHECKPOINTS.n8n}/api/health`;
      const res = await fetch(webhookUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      checks.n8n = { ok: res.status < 500 };
      if (!checks.n8n.ok) {
        checks.n8n.detail = `HTTP ${res.status}`;
      }
    } else {
      // Fallback: try the app's own lead-capture endpoint as a proxy
      const res = await fetch(`${CHECKPOINTS.n8n || ''}/api/lead-capture`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      checks.n8n = { ok: res.status < 500 };
    }
  } catch {
    checks.n8n = { ok: false, detail: 'Connection timeout or unreachable' };
  }

  for (const s of Object.values(checks)) {
    if (!s.ok) allOk = false;
  }

  return NextResponse.json({ ok: allOk, checks, timestamp: new Date().toISOString() }, { status: allOk ? 200 : 503 });
}
