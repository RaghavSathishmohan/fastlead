# LeadFast Session Summary

**Date:** 2026-05-09
**Project:** LeadFast — AI-powered construction lead response system
**Location:** ~/Desktop/leadfast (was /tmp/fastlead, moved to Desktop)
**Vercel Project:** raghavsathishmohans-projects/leadfast

---

## What Was Built

### Landing Page (`/`)
- Static marketing page with signup form
- Form fields: Company Name, Your Name, Email, Phone
- On submit: creates client in Supabase, sends welcome email via Resend
- Shows success card with dashboard link

### Dashboard (`/d/[token]`)
- Private per-client dashboard (server-side rendered using service role key)
- Shows client contact info + lead list
- Uses Supabase Realtime for live lead updates

### Admin (`/admin`)
- Password-protected client list
- Shows all clients with: name, company, email, phone, dashboard link, created date
- **Actions:** Copy dashboard link, Open dashboard, Delete client (with confirmation)
- Delete cascades to leads (FK constraint)

### Backend
- **Supabase:** PostgreSQL DB with clients + leads tables
- **n8n:** Workflow automation on Railway (n8n.leadfast.raghavsathishmohan.com)
- **Resend:** Email delivery (domain verified: leadfast.raghavsathishmohan.com)
- **Vercel:** Next.js 14 hosting

---

## Important Configuration

### URLs
- Landing: https://leadfast.raghavsathishmohan.com
- Dashboard: https://app.leadfast.raghavsathishmohan.com/d/{token}
- Admin: https://leadfast.raghavsathishmohan.com/admin
- n8n: https://n8n.leadfast.raghavsathishmohan.com

### Vercel Environment Variables (Production)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valid, corrected during session)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD` = `leadfast-admin-2024` (change this in Vercel dashboard)
- `RESEND_API_KEY` = `re_azz7N97t_Dv9REaFyPac3RmvDF6pz7Nqo`
- `RESEND_FROM_EMAIL` = `alerts@leadfast.raghavsathishmohan.com`

### DNS (IONOS)
- `leadfast.raghavsathishmohan.com` A → `76.76.21.21`
- `app.leadfast.raghavsathishmohan.com` A → `76.76.21.21`
- `resend._domainkey.leadfast` TXT → DKIM key (see resend-dns-records.md)
- `send.leadfast` MX → `feedback-smtp.us-east-1.amazonses.com` priority 10
- `send.leadfast` TXT → `v=spf1 include:amazonses.com ~all`

---

## Known Issues / Fixes Applied

1. **Broken anon key** — The `NEXT_PUBLIC_SUPABASE_ANON_KEY` was corrupted (JWT from 1975). Fixed by replacing with correct key from Supabase dashboard. Dashboard SSR now uses service role key as fallback.

2. **Dashboard 404** — Initially caused by missing `SUPABASE_URL` env var in Vercel. Added and redeployed.

3. **Admin delete not working** — Password input was removed from DOM after login, so delete couldn't authenticate. Fixed by storing password in React state (`useState`).

4. **Missing schema columns** — Supabase schema didn't have `owner_phone` or `status` columns on `clients` table. User applied via SQL Editor.

5. **Email not sending** — `RESEND_API_KEY` was missing from Vercel. Added and domain verified.

---

## Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page with signup form |
| `src/app/d/[token]/page.tsx` | Client dashboard |
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/actions/signup.ts` | Server action: create client + send email |
| `src/app/actions/admin.ts` | Server actions: auth + delete client |
| `src/lib/supabase.ts` | Supabase client helpers |
| `src/lib/types.ts` | TypeScript types |
| `supabase/schema.sql` | DB schema (run in Supabase SQL Editor) |
| `workflows/` | n8n workflow JSON exports |
| `docs/` | SETUP, MONITORING, SALES_PLAYBOOK, TROUBLESHOOTING, PRIVACY, UPGRADE_ROADMAP |
| `.env.example` | Env template |
| `resend-dns-records.md` | Resend DNS records for IONOS |

---

## Next Steps / Outstanding

- **n8n workflows** still need to be activated in n8n UI (master workflow, heartbeat, cleanup)
- **Supabase schema** may need the `status` column added to `clients` if not already applied
- **Admin password** should be changed from default `leadfast-admin-2024`
- **Vercel auth** was disabled (`vercel project protection disable leadfast --sso`) — re-enable if needed for custom domains

---

## How to Edit Welcome Email

File: `src/app/actions/signup.ts` (lines 67–71)
Current footer: "This email is not monitored. Questions? Reach out to Raghav Sathishmohan at raghavsathishmohan@gmail.com or +1 732-447-6474"

After editing, run from `~/Desktop/leadfast`:
```bash
git add -A && git commit -m "update welcome email" && git push origin master && vercel --prod
```

---

## How to Deploy Changes

```bash
cd ~/Desktop/leadfast
npm run build        # verify locally
git add -A && git commit -m "your message" && git push origin master
vercel --prod        # deploy to production
```
