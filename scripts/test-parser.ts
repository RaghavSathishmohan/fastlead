import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// ─── CONFIG ───
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://n8n.leadfast.raghavsathishmohan.com/webhook/lead-capture';
const API_URL = process.env.API_URL || 'http://localhost:3000/api/lead-capture';

// Test payload — simulates a lead form submission
const TEST_PAYLOAD = {
  token: 'demo-token-123',
  body: 'Hi, my name is John Smith and I need an emergency roof repair in Austin. My number is 512-555-0199 and email is john.smith@example.com. This is urgent — storm damage from last night.',
};

async function testGeminiParser() {
  console.log('\n=== Test 1: Direct Gemini API Call ===');
  if (!GOOGLE_AI_API_KEY) {
    console.log('❌ GOOGLE_AI_API_KEY not set. Skipping.');
    return;
  }

  const prompt = `You are a lead extraction parser for a construction company. Extract the following fields from the input text and return ONLY a JSON object with these keys: name, phone, email, service, city, urgency.

urgency should be one of: low, medium, high.
If a field is not found, use null. Return valid JSON only, no markdown.

Input text to parse:
${TEST_PAYLOAD.body}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.log(`❌ Gemini API error ${res.status}: ${text}`);
      return;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = JSON.parse(text);

    console.log('✅ Gemini parsed:', parsed);
    return parsed;
  } catch (err) {
    console.log('❌ Gemini test failed:', err instanceof Error ? err.message : err);
  }
}

async function testSupabaseConnection() {
  console.log('\n=== Test 2: Supabase Connection ===');
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.log('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Skipping.');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await supabase.from('clients').select('id, token').limit(1);
    if (error) {
      console.log('❌ Supabase error:', error.message);
      return;
    }
    console.log('✅ Supabase OK. Sample client:', data?.[0]);
    return data?.[0];
  } catch (err) {
    console.log('❌ Supabase test failed:', err instanceof Error ? err.message : err);
  }
}

async function testLocalApiRoute() {
  console.log('\n=== Test 3: Local Next.js API Route ===');
  try {
    // Find a real token from Supabase if available
    const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);
    const { data: client } = await supabase.from('clients').select('token').limit(1).single();
    const token = client?.token || TEST_PAYLOAD.token;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...TEST_PAYLOAD, token }),
    });

    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(body, null, 2));

    if (res.ok && body.success) {
      console.log('✅ Local API route works!');
    } else {
      console.log('❌ Local API route returned error.');
    }
  } catch (err) {
    console.log('❌ Local API test failed (is dev server running?):', err instanceof Error ? err.message : err);
  }
}

async function testN8nWebhook() {
  console.log('\n=== Test 4: n8n Webhook ===');
  try {
    // Find a real token from Supabase if available
    const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);
    const { data: client } = await supabase.from('clients').select('token').limit(1).single();
    const token = client?.token || TEST_PAYLOAD.token;

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...TEST_PAYLOAD, token }),
    });

    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(body, null, 2));

    if (res.ok) {
      console.log('✅ n8n webhook works!');
    } else {
      console.log('❌ n8n webhook returned error.');
    }
  } catch (err) {
    console.log('❌ n8n webhook test failed:', err instanceof Error ? err.message : err);
  }
}

async function runAll() {
  console.log('LeadFast End-to-End Test Script');
  console.log('================================');

  await testGeminiParser();
  await testSupabaseConnection();
  await testLocalApiRoute();
  await testN8nWebhook();

  console.log('\n=== Done ===\n');
}

runAll();
