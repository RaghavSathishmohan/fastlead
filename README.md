# FastLead

AI-powered construction lead response system. Automatically captures, qualifies, and responds to construction leads via SMS/Email.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Lead      │────▶│    n8n      │────▶│  Supabase   │
│   Source    │     │  Webhook    │     │   (Data)    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │◀────│   Next.js   │◀────│   Resend    │
│  Dashboard  │     │   Dashboard │     │  (Email)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Services

| Service | Purpose | URL |
|---------|---------|-----|
| n8n | Workflow automation | https://n8n.leadfast.raghavsathishmohan.com |
| Next.js Dashboard | Client dashboard | https://leadfast.raghavsathishmohan.com |
| Supabase | Database & Auth | https://qzkpdwvrrnychbmmwazf.supabase.co |
| Resend | Email delivery | leadfast.raghavsathishmohan.com |

## Tech Stack

- **Frontend:** Next.js 16, Tailwind CSS v4, shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Automation:** n8n (self-hosted on Railway)
- **Email:** Resend
- **Hosting:** Vercel (frontend), Railway (n8n)

## Local Development

```bash
# 1. Clone repo
git clone https://github.com/RaghavSathishmohan/fastlead.git
cd fastlead

# 2. Install dependencies
pnpm install

# 3. Copy env and fill in values
cp .env.example .env.local

# 4. Run dev server
pnpm dev
```

## Environment Variables

See `.env.example` for required variables.

## Project Structure

```
├── src/                 # Next.js app source
├── workflows/           # n8n workflow exports
├── supabase/            # Schema and migrations
├── .env.example         # Env template
└── README.md            # This file
```

## n8n Workflows

Workflow exports are stored in `/workflows/` and imported into the self-hosted n8n instance.

## License

Proprietary
