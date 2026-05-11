import { NextRequest, NextResponse } from 'next/server';

const LEADFAST_CAPTURE_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/lead-capture`
  : 'https://leadfast-b5dvxd5ya-raghavsathishmohans-projects.vercel.app/api/lead-capture';

interface SiteMapping {
  [siteKey: string]: string;
}

function getSiteTokenMap(): SiteMapping {
  const raw = process.env.SITE_TOKEN_MAP;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SiteMapping;
  } catch {
    return {};
  }
}

function corsResponse(body: Record<string, unknown> | null, status: number) {
  const res = NextResponse.json(body, { status });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() {
  return corsResponse(null, 204);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { site_key, name, phone, email, service, message } = body;

    if (!site_key) {
      return corsResponse({ error: 'Missing site_key' }, 400);
    }

    const map = getSiteTokenMap();
    const clientToken = map[site_key];

    if (!clientToken) {
      return corsResponse({ error: 'Unknown site_key' }, 404);
    }

    const leadBody = [
      `Name: ${name || 'Unknown'}`,
      `Phone: ${phone || 'N/A'}`,
      `Email: ${email || 'N/A'}`,
      `Service: ${service || 'General Inquiry'}`,
      message ? `Message: ${message}` : '',
    ].join('\n');

    const res = await fetch(LEADFAST_CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: clientToken, body: leadBody }),
    });

    const data = await res.json();
    return corsResponse(data, res.status);
  } catch {
    return corsResponse({ error: 'Proxy failed' }, 500);
  }
}
