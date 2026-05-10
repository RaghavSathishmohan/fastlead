import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withRetry } from '@/lib/retry';
import { rateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleApiKey = process.env.GOOGLE_AI_API_KEY;
const resendKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL || 'alerts@leadfast.raghavsathishmohan.com';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadfast.raghavsathishmohan.com';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface ParsedLead {
  name: string | null;
  phone: string | null;
  email: string | null;
  service: string | null;
  city: string | null;
  urgency: 'low' | 'medium' | 'high';
}

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceKey);
}

function extractTokenAndText(body: unknown): { token: string; rawText: string } {
  const input = body as Record<string, unknown>;

  const token =
    typeof input.token === 'string'
      ? input.token
      : typeof input.query === 'object' && input.query !== null
        ? (input.query as Record<string, unknown>).token as string
        : '';

  let rawText = '';
  if (typeof input.body === 'string') {
    rawText = input.body;
  } else if (typeof input.message === 'string') {
    rawText = input.message;
  } else if (typeof input.html === 'string') {
    rawText = input.html.replace(/<[^>]*>/g, ' ');
  } else {
    rawText = JSON.stringify(input.body ?? input);
  }

  rawText = rawText.replace(/\s+/g, ' ').trim();
  return { token, rawText };
}

async function parseWithGemini(rawText: string): Promise<ParsedLead> {
  if (!googleApiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  const prompt = `You are a lead extraction parser for a construction company. Extract the following fields from the input text and return ONLY a JSON object with these keys: name, phone, email, service, city, urgency.

urgency should be one of: low, medium, high. Infer urgency from phrases like "ASAP", "urgent", "emergency" (high), "soon", "this week" (medium), or general inquiries (low).

If a field is not found, use null. Return valid JSON only, no markdown.

Input text to parse:
${rawText}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
              service: { type: 'string' },
              city: { type: 'string' },
              urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
          },
          temperature: 0.1,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

  let parsed: Partial<ParsedLead> = {};
  try {
    parsed = JSON.parse(text) as Partial<ParsedLead>;
  } catch {
    // Fallback: try to extract from raw text with regex
    const match = text.match(/\{[^]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]) as Partial<ParsedLead>;
      } catch {
        // ignore
      }
    }
  }

  const phoneRegex = /^1?[-\s.]?(\([0-9]{3}\)|[0-9]{3})[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validatedUrgency = ['low', 'medium', 'high'].includes(parsed.urgency ?? '')
    ? (parsed.urgency as 'low' | 'medium' | 'high')
    : 'medium';

  return {
    name: parsed.name?.trim() || null,
    phone: parsed.phone && phoneRegex.test(parsed.phone) ? parsed.phone : null,
    email: parsed.email && emailRegex.test(parsed.email) ? parsed.email : null,
    service: parsed.service?.trim() || 'General Inquiry',
    city: parsed.city?.trim() || null,
    urgency: validatedUrgency,
  };
}

async function sendOwnerAlertEmail(
  ownerEmail: string,
  companyName: string,
  token: string,
  lead: ParsedLead
): Promise<void> {
  if (!resendKey) return;

  const dashboardUrl = `${appUrl}/d/${token}`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `LeadFast <${resendFrom}>`,
      to: ownerEmail,
      subject: `NEW LEAD: ${lead.name ?? 'Unknown'} — ${lead.service} (${lead.urgency})`,
      text: `NEW LEAD RECEIVED\n\nName: ${lead.name ?? 'Unknown'}\nPhone: ${lead.phone ?? 'N/A'}\nEmail: ${lead.email ?? 'N/A'}\nService: ${lead.service}\nCity: ${lead.city ?? 'N/A'}\nUrgency: ${lead.urgency}\n\nView in dashboard:\n${dashboardUrl}`,
    }),
  });
}

async function addResendContact(email: string, firstName?: string | null, lastName?: string | null): Promise<void> {
  if (!resendKey) return;

  await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      unsubscribed: false,
      audience_id: process.env.RESEND_AUDIENCE_ID || undefined,
    }),
  });
}

async function sendCustomerReply(
  customerEmail: string,
  customerName: string | null,
  companyName: string,
  service: string | null
): Promise<void> {
  if (!resendKey) return;

  const name = customerName || 'there';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${companyName} <${resendFrom}>`,
      to: customerEmail,
      subject: `Thanks for reaching out to ${companyName}`,
      text: `Hi ${name},\n\nThank you for contacting ${companyName}. We've received your request for ${service} and will be in touch shortly.\n\nIf this is urgent, please call us directly.\n\nBest,\n${companyName} Team\n\nThis email is not monitored. Questions? Reach out to Raghav Sathishmohan at raghavsathishmohan@gmail.com or +1 732-447-6474.`,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const limit = rateLimit(`lead:${ip}`, { maxRequests: 20, windowMs: 60000 });

    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { token, rawText } = extractTokenAndText(body);

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    if (!rawText) {
      return NextResponse.json({ error: 'Missing lead content' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch client by token
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('token', token)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Parse with Gemini
    const parsed = await parseWithGemini(rawText);

    // Insert lead into Supabase
    const { data: leadRow, error: insertError } = await supabase
      .from('leads')
      .insert({
        client_id: client.id,
        name: parsed.name ?? 'Unknown',
        phone: parsed.phone,
        email: parsed.email,
        service: parsed.service,
        city: parsed.city,
        urgency: parsed.urgency,
        raw_input: rawText,
        owner_notified: true,
        customer_replied: !!parsed.email,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: `Failed to insert lead: ${insertError.message}` }, { status: 500 });
    }

    // Send owner alert with retry
    if (client.owner_email) {
      try {
        await withRetry(
          () => sendOwnerAlertEmail(client.owner_email, client.company_name, token, parsed),
          { retries: 3, delay: 500 }
        );
      } catch {
        Sentry.captureMessage('Owner alert email failed after retries');
      }
    }

    // Send customer auto-reply with retry
    if (parsed.email) {
      try {
        // Add contact first to avoid Resend suppression
        await addResendContact(parsed.email, parsed.name?.split(' ')[0], parsed.name?.split(' ').slice(1).join(' '));
        await withRetry(
          () => sendCustomerReply(parsed.email!, parsed.name, client.company_name, parsed.service),
          { retries: 3, delay: 500 }
        );
      } catch {
        Sentry.captureMessage('Customer reply email failed after retries');
      }
    }

    return NextResponse.json({
      success: true,
      lead: leadRow,
      parsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    Sentry.captureException(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
