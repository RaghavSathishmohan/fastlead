# LeadFast Troubleshooting

## n8n Issues

### Workflow Not Triggering
- Check webhook URL is correct in n8n
- Verify workflow is activated (toggle is on)
- Check execution logs for errors
- Test webhook with curl:
```bash
curl -X POST https://n8n.leadfast.raghavsathishmohan.com/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{"client_id":"test","name":"Test","phone":"555-1234"}'
```

### n8n Service Down
- Check Railway dashboard: all 4 services should be green
- If Primary is down, check logs in Railway
- Restart Primary service if needed

## Email Issues

### Owner Not Receiving Alerts
- Check spam/junk folder
- Verify Resend domain is verified
- Check Resend dashboard for blocked/bounce events
- Test with a different recipient email

### Auto-Reply Not Sending
- Verify customer email is valid and parsed correctly
- Check Resend API key is active
- Check Resend sending limits (3,000/mo on free)

## Dashboard Issues

### Leads Not Showing
- Check browser console for Supabase errors
- Verify client token in URL is correct
- Check RLS policies in Supabase
- Test Supabase query directly:
```sql
SELECT * FROM leads WHERE client_id = 'your-client-uuid';
```

### Realtime Not Working
- Check if browser supports WebSocket
- Polling fallback runs every 30s automatically
- Verify Supabase realtime is enabled on leads table

## Supabase Issues

### Project Paused
Free tier pauses after 7 days. Resume at app.supabase.com.

### RLS Errors
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Connection Issues
- Check Supabase URL and anon key in environment variables
- Verify IP restrictions (should be none for web app)

## DNS Issues

### Domain Not Resolving
```bash
dig n8n.leadfast.raghavsathishmohan.com +short
dig app.leadfast.raghavsathishmohan.com +short
```

If no output, DNS records are missing. Check IONOS dashboard.

## Recovery Procedures

### n8n Complete Reset
1. Export workflows from n8n (Settings → Export)
2. Delete Railway project
3. Re-deploy from Railway n8n template
4. Import workflows
5. Re-configure credentials

### Supabase Data Loss
1. Check if project is just paused (resume it)
2. If deleted, create new project
3. Run schema.sql to recreate tables
4. Re-add clients via onboarding script
