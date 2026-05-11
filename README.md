# LeadFast

AI-powered contracting lead response system. Instantly captures, parses, and responds to contracting leads via email with a live mobile dashboard.

## Architecture

```
├───────────┬─────────────┬───────────┐
│   Lead      │     n8n       │  Supabase   │
│   Source    │   Webhook     │   (Data)    │
└───────────┴─────────────┴───────────┘
                           │
                           ▼
├───────────┬─────────────┬───────────┐
│   Client    ◀─── Next.js   ◀───  Resend    │
│ Dashboard   │ Dashboard │  (Email)    │
└───────────┴─────────────┴───────────┘
```

## Services

| Service | Purpose | URL |
|---------|---------|-----|
| n8n | Workflow automation | https://n8n.leadfast.raghavsathishmohan.com |
| Dashboard | Client dashboard | https://app.leadfast.raghavsathishmohan.com |
| Landing | Marketing site | https://leadfast.raghavsathishmohan.com |
| Supabase | Database | https://qzkpdwvrrnychbmmwazf.supabase.co |
| Resend | Email delivery | leadfast.raghavsathishmohan.com |

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Database:** Supabase (PostgreSQL + Realtime)
- **Automation:** n8n (self-hosted on Railway)
- **Email:** Resend
- **AI:** Google Gemini Flash (lead parsing)
- **Hosting:** Vercel (frontend), Railway (n8n)

## Quick Start

```bash
# 1. Clone repo
git clone https://github.com/RaghavSathishmohan/fastlead.git
cd fastlead

# 2. Install dependencies
npm install

# 3. Copy env and fill in values
cp .env.example .env.local

# 4. Run dev server
npm run dev
```

## Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or push to GitHub (auto-deploys via Vercel integration)
git push origin main
```

## Project Structure

```
├─── src/
│   ├─── app/
│   │   ├─── d/[token]/      # Client dashboard
│   │   ├─── page.tsx        # Landing page
│   │   └─── layout.tsx      # Root layout
│   ├─── components/
│   │   └─── dashboard/      # Dashboard UI
│   ├─── lib/
│   │   ├─── supabase.ts     # Supabase client
│   │   └─── types.ts        # TypeScript types
│   └─── app/actions/
│       └─── onboard.ts      # Server action
├─── workflows/            # n8n workflow JSON exports
├─── supabase/
│   └─── schema.sql          # Database schema
├─── scripts/
│   └─── onboard-client.js   # CLI onboarding
├─── docs/                  # Documentation
│   ├─── SETUP.md
│   ├─── MONITORING.md
│   ├─── SALES_PLAYBOOK.md
│   ├─── TROUBLESHOOTING.md
│   ├─── PRIVACY.md
│   └─── UPGRADE_ROADMAP.md
├─── .env.example
└─── README.md
```

## Documentation

- [Setup Guide](docs/SETUP.md) — Infrastructure and client onboarding
- [Monitoring](docs/MONITORING.md) — Weekly audit checklist
- [Sales Playbook](docs/SALES_PLAYBOOK.md) — Pricing and cold call script
- [Troubleshooting](docs/TROUBLESHOOTING.md) — Common failures and fixes
- [Privacy](docs/PRIVACY.md) — Data retention and compliance
- [Upgrade Roadmap](docs/UPGRADE_ROADMAP.md) — Phase 2: SMS and beyond

## n8n Workflows

| Workflow | Purpose | Schedule |
|----------|---------|----------|
| master-workflow | Lead capture → AI parse → alert → auto-reply | Webhook trigger |
| heartbeat | Keep Supabase alive (free tier) | Every 6 days |
| cleanup | Delete old resolved leads | Weekly |

## License

Proprietary
