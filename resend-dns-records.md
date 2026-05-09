# Resend DNS Records for leadfast.raghavsathishmohan.com

Domain ID: `b5389edf-961a-4836-9eab-e1dfada61b11`
Status: `not_started` (pending DNS verification)

## Required DNS Records

### 1. DKIM (TXT)
- **Name:** `resend._domainkey.leadfast`
- **Type:** TXT
- **Value:**
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDaFZaIZ4GHY11WkjBptI72Uvmg/QEb4lpYqjCBhsvaab0W4wvNDiYBfZOZrGSEf7D32S2sBg+gIl9KH4TN5d+7T8bNge7fdmaITaguQ4gTMiAeZ+nD8PqFTLPjVBV3xvw5ZfNb/1id0sOHUJ5DI43cb9PYHDDBM24Bt0+SG5xgHwIDAQAB
```

### 2. SPF - MX Record
- **Name:** `send.leadfast`
- **Type:** MX
- **Value:** `feedback-smtp.us-east-1.amazonses.com`
- **Priority:** 10

### 3. SPF - TXT Record
- **Name:** `send.leadfast`
- **Type:** TXT
- **Value:** `v=spf1 include:amazonses.com ~all`

## Next Steps
Add these records to your DNS provider, then Resend will verify automatically.
