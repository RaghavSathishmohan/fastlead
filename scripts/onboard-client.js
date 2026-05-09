#!/usr/bin/env node
/**
 * FastLead Client Onboarding Script
 * Usage: node scripts/onboard-client.js "John Doe" "john@example.com" "Acme Roofing" "(555) 123-4567"
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function onboardClient(name, email, company, phone) {
  const { data, error } = await supabase
    .from('clients')
    .insert({ name, owner_email: email, company_name: company, owner_phone: phone || null })
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to create client:', error?.message);
    process.exit(1);
  }

  console.log('\n✅ Client created successfully\n');
  console.log('Token:', data.token);
  console.log('Dashboard:', `https://app.leadfast.raghavsathishmohan.com/d/${data.token}`);
  console.log('Webhook:', `https://n8n.leadfast.raghavsathishmohan.com/webhook/lead-capture`);
  console.log('\nSend this to the client:\n');
  console.log(`Hi ${name}, your FastLead dashboard is live at:`);
  console.log(`https://app.leadfast.raghavsathishmohan.com/d/${data.token}`);
  console.log('\nAdd this webhook URL to your website form action:');
  console.log(`https://n8n.leadfast.raghavsathishmohan.com/webhook/lead-capture`);
  console.log(`\nInclude this hidden field in your form:`);
  console.log(`<input type="hidden" name="client_id" value="${data.id}" />`);
}

const [,, name, email, company, phone] = process.argv;

if (!name || !email || !company) {
  console.log('Usage: node scripts/onboard-client.js "Name" "Email" "Company" ["Phone"]');
  process.exit(1);
}

onboardClient(name, email, company, phone);
