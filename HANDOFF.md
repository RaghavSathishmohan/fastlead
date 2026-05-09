# LeadFast — Next Session Handoff

**Project:** ~/Desktop/leadfast
**Status:** Landing page + signup, admin dashboard, client dashboard all deployed and working
**Vercel:** https://leadfast.raghavsathishmohan.com

---

## What's Done (from this session)

- Landing page signup form creates clients in Supabase and sends welcome email via Resend
- Admin dashboard at `/admin` (password: `leadfast-admin-2024`) — lists clients, copy dashboard links, delete clients
- Client dashboard at `/d/[token]` — shows contact info + real-time leads
- DNS configured: `leadfast.raghavsathishmohan.com` and `app.leadfast.raghavsathishmohan.com`
- Resend domain verified, emails sending
- Supabase anon key fixed, service role key working
- Master workflow JSON updated to look up client by token before inserting lead

## Immediate Next Steps (in order)

1. **Apply Supabase schema** — Go to Supabase SQL Editor and run `supabase/schema.sql` (adds `status` column + indexes)
2. **Configure n8n credentials** — Log into n8n at https://n8n.leadfast.raghavsathishmohan.com and add:
   - Supabase API credentials (`supabase-credentials`)
   - Resend API credentials (`resend-credentials`)
   - Postgres credentials (`supabase-postgres`) for cleanup workflow
3. **Import + activate workflows** — Import the 3 JSON files from `workflows/`, then activate each:
   - `master-workflow.json` (lead capture → AI parse → alert → auto-reply)
   - `heartbeat-workflow.json` (keeps Supabase alive every 6 days)
   - `cleanup-workflow.json` (deletes old leads weekly)
4. **Test end-to-end** — Send a POST to the webhook with a valid client token, verify lead appears in dashboard and owner gets email alert
5. **Change admin password** — Update `ADMIN_PASSWORD` in Vercel env vars from default

## File Reference

| File | Purpose |
|------|---------|
| `SESSION-SUMMARY.md` | Full project summary with all URLs, env vars, DNS records, known issues |
| `supabase/schema.sql` | Database schema (run in Supabase SQL Editor) |
| `workflows/*.json` | n8n workflow exports |
| `src/app/actions/signup.ts` | Welcome email copy (edit here) |
| `.env.example` | Environment variable template |
| `resend-dns-records.md` | Resend DNS records |

## Quick Commands

```bash
cd ~/Desktop/leadfast
npm run build          # verify locally
git add -A && git commit -m "message" && git push origin master
vercel --prod          # deploy
```
