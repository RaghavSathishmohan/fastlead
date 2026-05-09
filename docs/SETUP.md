# FastLead Setup Guide

## Quick Start

### 1. Deploy n8n (Done)
Railway template deployed at `n8n.leadfast.raghavsathishmohan.com`

### 2. Configure Supabase (Done)
Run `supabase/schema.sql` in the SQL Editor

### 3. Configure Resend (Done)
Domain `leadfast.raghavsathishmohan.com` verified

### 4. Deploy Dashboard
```bash
cd /tmp/fastlead
vercel --prod
```

## Client Onboarding

### Option A: Website Form Integration

Add to any website form:
```html
<form action="https://n8n.leadfast.raghavsathishmohan.com/webhook/lead-capture" method="POST">
  <input type="hidden" name="client_id" value="CLIENT_UUID" />
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="tel" name="phone" placeholder="Phone" />
  <input type="email" name="email" placeholder="Email" />
  <input type="text" name="service" placeholder="Service Needed" />
  <input type="text" name="city" placeholder="City" />
  <button type="submit">Get Quote</button>
</form>
```

### Option B: No Website (Email Forwarding)

1. Create a Gmail filter to forward lead emails to your FastLead email alias
2. Or: Set up IMAP in n8n to watch the client's inbox directly

### WordPress Integration

Use Contact Form 7 or WPForms with webhook add-on pointing to the FastLead webhook URL.

### Wix / Webflow

Use native form → webhook/Zapier → FastLead webhook URL.

## Running the Onboarding Script

```bash
node scripts/onboard-client.js "John Doe" "john@roofing.com" "Acme Roofing" "(555) 123-4567"
```

This creates:
- Client record in Supabase
- UUID token for dashboard access
- Dashboard URL to share with client

## n8n Workflow Import

1. Log in to n8n at `n8n.leadfast.raghavsathishmohan.com`
2. Go to Workflows → Import from File
3. Import `workflows/master-workflow.json`
4. Import `workflows/heartbeat-workflow.json`
5. Import `workflows/cleanup-workflow.json`
6. Configure credentials (Supabase, Resend, Gemini)
7. Activate all workflows
