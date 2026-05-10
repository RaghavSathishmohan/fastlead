# LeadFast Client Setup Guide

## Overview

LeadFast is an AI-powered lead capture system for local service businesses. It intercepts leads from your website forms, email forwarding, or API, parses them instantly with AI, and delivers them to your dashboard with instant alerts.

---

## Table of Contents

1. [Sign Up & Account Creation](#1-sign-up--account-creation)
2. [Get Your Token](#2-get-your-token)
3. [Choose Your Integration Method](#3-choose-your-integration-method)
4. [Method A: Email Forwarding (Easiest)](#method-a-email-forwarding)
5. [Method B: Website Embed (Recommended)](#method-b-website-embed)
6. [Method C: Developer API](#method-c-developer-api)
7. [Test Your Setup](#7-test-your-setup)
8. [Access Your Dashboard](#8-access-your-dashboard)
9. [Configure Notifications](#9-configure-notifications)
10. [Troubleshooting](#10-troubleshooting)
11. [FAQ](#11-faq)

---

## 1. Sign Up & Account Creation

### Step 1: Visit the Landing Page
Navigate to: **https://leadfast.raghavsathishmohan.com**

### Step 2: Fill Out the Signup Form
On the landing page, find the signup form and enter:

- **Company Name** — Your business name (e.g., "NJ Solar Pros")
- **Email** — Your primary business email (this is where lead alerts go)
- **Phone** — Your business phone number
- **Service Type** — What you do (e.g., "Solar Installation", "Fence Building")
- **City** — Your primary service area (e.g., "Edison, NJ")

### Step 3: Choose Your Plan
You will be redirected to Stripe Checkout:

| Plan | Price | Features |
|------|-------|----------|
| Monthly | $29/mo | Unlimited leads, email alerts, auto-reply |

**Discount Code:** Enter `FREEDASHBOARD` to skip payment and activate immediately.

### Step 4: Complete Checkout
After payment (or discount activation), you will receive:
- Your unique **client token**
- Your **dashboard URL**
- Setup instructions via email

---

## 2. Get Your Token

Your **client token** is a unique identifier that looks like this:

```
90bf2822-5ec2-42d6-abc1-8fa0a86e073b
```

This token is required for ALL integration methods. Keep it safe.

### Where to Find It
After signup, your token is displayed on the confirmation page and sent in your welcome email.

### Where to Use It
- Email forwarding address: `leads+YOUR_TOKEN@leadfast.raghavsathishmohan.com`
- Website embed: `data-token="YOUR_TOKEN"`
- API calls: `"token": "YOUR_TOKEN"`

---

## 3. Choose Your Integration Method

LeadFast offers three ways to capture leads. Choose the one that fits your workflow:

| Method | Difficulty | Best For |
|--------|-----------|----------|
| **A. Email Forwarding** | Easy (1 minute) | Businesses that get leads via email |
| **B. Website Embed** | Easy (5 minutes) | Businesses with a website contact form |
| **C. Developer API** | Medium | Developers building custom integrations |

You can use **multiple methods at once**.

---

## Method A: Email Forwarding

**Best for:** You receive leads via email (e.g., Thumbtack, Angi, website contact form emails).

### Step 1: Copy Your Forwarding Address

Your unique forwarding address is:

```
leads+YOUR_TOKEN@leadfast.raghavsathishmohan.com
```

Replace `YOUR_TOKEN` with your actual token.

Example:
```
leads+90bf2822-5ec2-42d6-abc1-8fa0a86e073b@leadfast.raghavsathishmohan.com
```

### Step 2: Set Up Email Forwarding

#### Gmail
1. Open **Gmail** and click the gear icon → **See all settings**
2. Go to the **Forwarding and POP/IMAP** tab
3. Click **Add a forwarding address**
4. Paste your LeadFast forwarding address
5. Gmail will send a verification code — the lead will appear in your dashboard, ignore the verification email
6. Select **Forward a copy of incoming mail to** your LeadFast address
7. Choose whether to keep a copy in Gmail or delete it
8. Click **Save Changes**

#### Outlook / Hotmail
1. Go to **Settings** → **Mail** → **Forwarding**
2. Check **Start forwarding**
3. Enter your LeadFast forwarding address
4. Choose whether to keep copies
5. Click **Save**

#### Apple Mail (iCloud)
1. Go to **iCloud.com** → **Mail** → **Settings** (gear icon)
2. Choose **Rules** → **Add a Rule**
3. Set condition: **If a message is from** [your lead source]
4. Set action: **Forward to** your LeadFast address
5. Click **Done**

#### Custom Domain / Business Email (cPanel, Google Workspace, etc.)
1. Log in to your email admin panel
2. Find **Email Forwarding** or **Mail Rules**
3. Create a forwarder:
   - From: `info@yourcompany.com` (or wherever leads arrive)
   - To: `leads+YOUR_TOKEN@leadfast.raghavsathishmohan.com`
4. Save

#### Specific Platforms

**Thumbtack:**
- Thumbtack sends lead notifications to your email
- Forward those emails to your LeadFast address

**Angi / HomeAdvisor:**
- Lead emails arrive from Angi
- Set up a filter to forward Angi emails to LeadFast

**Zillow / Realtor.com:**
- Buyer/seller inquiries arrive via email
- Forward to LeadFast for instant parsing

### Step 3: Test It
Send a test email to your business address with this content:

```
Subject: New Lead - Solar Quote Request

Name: John Smith
Phone: (555) 123-4567
Email: john@example.com
Service: Solar panel installation
City: Edison, NJ
Message: Looking for a quote for my 3-bedroom home.
```

Check your dashboard — the lead should appear within 10 seconds.

---

## Method B: Website Embed

**Best for:** You have a website with a contact form.

### Step 1: Add One Line of Code

Paste this **single script tag** just before the closing `</body>` tag on every page that has a contact form:

```html
<script src="https://leadfast.raghavsathishmohan.com/embed.js" data-token="YOUR_TOKEN"></script>
```

Replace `YOUR_TOKEN` with your actual token.

### Step 2: Where to Place It

Place the script on:
- Your **Contact** page
- Your **Get a Quote** page
- Your **Landing pages** with forms
- Any page with an email input field

### Step 3: How It Works

The embed script automatically:
1. Finds all forms on the page
2. Detects which forms have email/phone/name fields
3. Intercepts the form submission
4. Sends the lead data to LeadFast
5. Allows the form to submit normally (no disruption)

**Your visitors will not notice anything different.**

### Step 4: Verify Installation

1. Open your website
2. Open **Browser Developer Tools** (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Look for this message:
   ```
   [LeadFast] Initialized with token: YOUR_TOKEN
   [LeadFast] Found 1 form(s)
   ```

If you see these messages, the embed is working.

### Step 5: Test It

Fill out your contact form with test data:

- Name: Test User
- Email: your-email@example.com
- Phone: (555) 123-4567
- Message: This is a test lead

Check your dashboard — the lead should appear instantly.

### Alternative: Manual Integration

If the auto-detect doesn't work with your form, you can trigger LeadFast manually:

```html
<script src="https://leadfast.raghavsathishmohan.com/embed.js" data-token="YOUR_TOKEN"></script>
<script>
  // After your form submits, call this:
  document.getElementById('myForm').addEventListener('submit', function(e) {
    // LeadFast auto-captures, but you can also manually trigger:
    if (window.LeadFast) {
      window.LeadFast.capture({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: 'Your Service',
        city: 'Your City',
        message: document.getElementById('message').value
      });
    }
  });
</script>
```

---

## Method C: Developer API

**Best for:** Developers building custom integrations.

### API Endpoint

```
POST https://leadfast.raghavsathishmohan.com/api/lead-capture
```

### Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "token": "YOUR_TOKEN",
  "body": "Raw lead text or JSON"
}
```

### Example: cURL

```bash
curl -X POST https://leadfast.raghavsathishmohan.com/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "token": "90bf2822-5ec2-42d6-abc1-8fa0a86e073b",
    "body": "Name: Sarah Johnson\nPhone: (555) 987-6543\nEmail: sarah@example.com\nService: Fence installation\nCity: Princeton, NJ"
  }'
```

### Example: JavaScript (Fetch)

```javascript
const response = await fetch('https://leadfast.raghavsathishmohan.com/api/lead-capture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'YOUR_TOKEN',
    body: `Name: ${name}
Phone: ${phone}
Email: ${email}
Service: ${service}
City: ${city}`
  })
});

const data = await response.json();
console.log(data.lead);
```

### Example: Python (Requests)

```python
import requests

response = requests.post(
    'https://leadfast.raghavsathishmohan.com/api/lead-capture',
    json={
        'token': 'YOUR_TOKEN',
        'body': f'Name: {name}\nPhone: {phone}\nEmail: {email}\nService: {service}\nCity: {city}'
    }
)

lead = response.json()
print(lead)
```

### Response Format

Success (200):
```json
{
  "success": true,
  "lead": {
    "id": "uuid",
    "name": "Sarah Johnson",
    "phone": "(555) 987-6543",
    "email": "sarah@example.com",
    "service": "Fence installation",
    "city": "Princeton",
    "urgency": "medium",
    "status": "new",
    "created_at": "2026-05-10T14:30:00Z"
  },
  "parsed": {
    "name": "Sarah Johnson",
    "phone": "(555) 987-6543",
    "email": "sarah@example.com",
    "service": "Fence installation",
    "city": "Princeton",
    "urgency": "medium"
  }
}
```

Error (400/404/429/500):
```json
{
  "error": "Error message"
}
```

### Rate Limits

- 20 requests per minute per IP
- Exceeding the limit returns HTTP 429 (Too Many Requests)

---

## 7. Test Your Setup

### Send a Test Lead

Use the built-in test on your onboarding page, or send a POST request:

```bash
curl -X POST https://leadfast.raghavsathishmohan.com/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "body": "Name: Test User\nPhone: (555) 000-0000\nEmail: test@example.com\nService: Test Service\nCity: Test City\nUrgency: high"
  }'
```

### What to Expect

1. Lead appears in your dashboard within 5 seconds
2. You receive an email alert at your signup email
3. The customer receives an auto-reply (if email was provided)

---

## 8. Access Your Dashboard

Your dashboard URL:

```
https://app.leadfast.raghavsathishmohan.com/d/YOUR_TOKEN
```

### Dashboard Features

- **Real-time lead list** — Updates instantly when a lead arrives
- **Status tracking** — New, Contacted, Qualified, Converted, Archived
- **Contact info** — Name, phone, email, service, city, urgency
- **Raw input** — See exactly what the AI parsed
- **Mobile-friendly** — Works on any device

### How to Use

1. **View leads** — Open your dashboard URL
2. **Update status** — Click on a lead to change its status
3. **Contact leads** — Use the phone/email info to reach out
4. **Archive** — Mark dead leads as Archived to declutter

---

## 9. Configure Notifications

### Email Alerts

By default, lead alerts are sent to the email you used during signup.

To change this:
1. Contact support: **raghavsathishmohan@gmail.com**
2. Provide your token and new email address

### Auto-Reply to Customers

When a lead includes an email, LeadFast automatically sends a polite acknowledgment:

> Hi [Name],
>
> Thank you for contacting [Your Company]. We've received your request for [Service] and will be in touch shortly.
>
> If this is urgent, please call us directly.
>
> Best,
> [Your Company] Team

**No setup required** — this happens automatically.

---

## 10. Troubleshooting

### Problem: Leads are not appearing in my dashboard

**Check 1: Token is correct**
- Verify you're using the right token in your integration
- Check the token in your welcome email

**Check 2: Email forwarding**
- Send a test email to your business address
- Check if it gets forwarded to the LeadFast address
- Look for bounce-backs or delivery failures

**Check 3: Website embed**
- Open browser developer tools (F12)
- Go to Console tab
- Look for `[LeadFast]` messages
- If none appear, the script is not loading

**Check 4: API integration**
- Check the HTTP response code
- 400 = missing token or body
- 404 = token not found
- 429 = rate limited (wait 1 minute)
- 500 = server error, try again

### Problem: Emails are not being delivered

**Cause:** Resend (our email provider) may suppress external addresses on the free tier.

**Fix:**
1. Go to your Resend dashboard (if you have access)
2. Add your email to the contact list
3. Or contact us to verify your domain

### Problem: Parsed data is wrong

**Cause:** The AI parser may misread unusual formatting.

**Fix:**
- The raw input is always saved — you can see the original text in the dashboard
- Contact us with examples of mis-parsed leads so we can improve the AI

### Problem: Dashboard is not loading

**Check 1: URL is correct**
- Format: `https://app.leadfast.raghavsathishmohan.com/d/YOUR_TOKEN`
- No extra slashes or spaces

**Check 2: Supabase status**
- Check https://status.supabase.com for outages

**Check 3: Your account**
- Ensure your subscription is active
- Contact us if you need help

---

## 11. FAQ

**Q: Can I use multiple integration methods?**
A: Yes. You can use email forwarding, website embed, and API all at once.

**Q: Is there a limit on leads?**
A: The monthly plan includes unlimited leads.

**Q: Can I change my company name or email?**
A: Yes, contact us and we'll update your account.

**Q: What happens if I cancel?**
A: You lose access to the dashboard and lead capture stops. Export your leads first.

**Q: Is my data secure?**
A: Yes. All data is stored in Supabase (PostgreSQL) with row-level security. We do not sell or share your data.

**Q: Can I export my leads?**
A: Export functionality is coming soon. For now, contact us for a data export.

**Q: What if a lead's email is wrong?**
A: The auto-reply will fail silently. The lead still appears in your dashboard.

**Q: Does LeadFast work with CRMs?**
A: Not natively yet. Use the API to push leads to your CRM, or export periodically.

**Q: Can I white-label this?**
A: Not at this time. The dashboard shows LeadFast branding.

**Q: Who do I contact for support?**
A: Email **raghavsathishmohan@gmail.com** or call **(732) 447-6474**.

---

## Quick Reference Card

| Item | Value |
|------|-------|
| Landing Page | https://leadfast.raghavsathishmohan.com |
| Dashboard | https://app.leadfast.raghavsathishmohan.com/d/YOUR_TOKEN |
| Embed Script | `<script src="https://leadfast.raghavsathishmohan.com/embed.js" data-token="YOUR_TOKEN"></script>` |
| Forwarding Address | `leads+YOUR_TOKEN@leadfast.raghavsathishmohan.com` |
| API Endpoint | `POST https://leadfast.raghavsathishmohan.com/api/lead-capture` |
| Support Email | raghavsathishmohan@gmail.com |
| Support Phone | (732) 447-6474 |
| Discount Code | `FREEDASHBOARD` |

---

## Support

Need help? Reach out:

- **Email:** raghavsathishmohan@gmail.com
- **Phone:** (732) 447-6474
- **Response time:** Usually within 4 hours

---

*Document version: 1.0 | Last updated: 2026-05-10*
