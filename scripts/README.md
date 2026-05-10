# LeadFast Test Scripts

## `test-parser.ts`
End-to-end test that exercises every part of the lead capture pipeline:

1. **Direct Gemini API call** — Verifies Google AI key works and parses sample lead text.
2. **Supabase connection** — Checks DB connectivity.
3. **Local Next.js API route** — Sends a POST to `/api/lead-capture` (requires dev server running).
4. **n8n webhook** — Sends a POST to the live n8n webhook URL.

### Prerequisites
Add these env vars to your `.env.local`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_AI_API_KEY=AIzaSy...
WEBHOOK_URL=https://n8n.leadfast.raghavsathishmohan.com/webhook/lead-capture
```

### Run the test
```bash
# Ensure dependencies are installed
cd ~/Desktop/leadfast
npm install

# Run the test
npm run test:parser
```

### Expected output
- ✅ Gemini parsed: `{ name: "John Smith", phone: "512-555-0199", ... }`
- ✅ Supabase OK
- ✅ Local API route works!
- ✅ n8n webhook works!

If any step fails, the error message will tell you exactly which layer is broken.
