# LeadFast Privacy Policy

## Data Collection

LeadFast collects only the information necessary to route leads to construction businesses:
- Lead name, phone, email, service request, city
- Business owner contact information
- Timestamps of lead interactions

## Data Retention

- Active leads: Retained indefinitely while client is subscribed
- Resolved leads (won/lost): Automatically deleted after 90 days via cleanup workflow
- Client records: Retained for billing/accounting purposes

## Data Sharing

- Lead data is shared only with the business owner who received the lead
- No third-party data sales or marketing use
- AI parsing uses Google Gemini Flash API (data processing only, not training)

## Security

- Supabase Row Level Security isolates client data
- Dashboard access via UUID tokens (no passwords stored)
- All connections use HTTPS/TLS
- Email delivery via Resend with domain verification

## Compliance

- GDPR: Clients can request data export or deletion by contacting support
- CCPA: California residents can request data disclosure or deletion
- Data stored in US-based Supabase regions
