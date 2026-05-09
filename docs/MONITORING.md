# LeadFast Monitoring SOP

## Weekly Audit Checklist

- [ ] Check n8n execution logs for errors
- [ ] Verify Supabase lead count is growing
- [ ] Check Resend email delivery stats
- [ ] Test dashboard loads on mobile
- [ ] Verify at least 1 heartbeat execution in past 6 days
- [ ] Review 90-day cleanup ran successfully

## Alert Channels

- Telegram bot for n8n errors
- Resend bounce notifications
- Supabase paused project warnings (free tier)

## Common Issues

### Supabase Paused
Free tier pauses after 7 days inactivity. Resume at supabase.com dashboard.

### n8n Webhook 404
Check Railway service health. Restart if stuck.

### Email Not Delivering
Check Resend domain verification. Verify SPF/DKIM records in DNS.

## Cost Monitoring

| Service | Free Tier | Paid Trigger |
|---------|-----------|-------------|
| Railway | $5/mo credit | Hobby plan |
| Supabase | 500MB / paused | Pro $25/mo |
| Resend | 3,000/mo | $0.001/email |
| Vercel | Hobby free | Pro $20/mo |

Target: Stay within free tiers until 3+ paying clients.
