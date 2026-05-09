# LeadFast Upgrade Roadmap

## Phase 2: SMS Alerts ($20/mo additional)

### Twilio Integration
- Add Twilio SMS node to n8n workflow
- Owner gets instant SMS + email for high-urgency leads
- Customer gets SMS confirmation (optional)

### Implementation Steps
1. Upgrade Twilio account (add $20 deposit)
2. Buy Twilio phone number ($1/mo)
3. Add Twilio credentials to n8n
4. Create SMS alert branch in master workflow
5. Add SMS opt-in toggle to client onboarding

### Cost Impact
| Before | After |
|--------|-------|
| $5/mo infra | $26/mo infra |
| $197/mo price | $297/mo price |
| $192 profit | $271 profit |

## Phase 3: AI Lead Scoring
- Gemini analyzes lead quality (budget signals, timeline, specificity)
- Score: Hot/Warm/Cold
- Prioritize hot leads in dashboard

## Phase 4: Multi-User Teams
- Add team members to client account
- Role-based access (owner, manager, sales rep)
- Lead assignment and notes

## Phase 5: Website Builder
- Simple landing page builder for clients without websites
- Form templates by trade type
- Basic SEO optimization

## Phase 6: Analytics
- Lead source tracking
- Conversion rate by source
- Response time analytics
- Monthly lead reports
