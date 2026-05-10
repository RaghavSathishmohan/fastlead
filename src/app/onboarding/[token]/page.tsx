'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Copy,
  CheckCircle,
  Mail,
  Code,
  Zap,
  ArrowRight,
  ExternalLink,
  Play,
  MessageSquare,
  Globe
} from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-[var(--color-text-tertiary)] hover:text-brand-400 transition-colors p-1.5 rounded-md hover:bg-[var(--color-surface-hover)]"
      title="Copy"
    >
      {copied ? (
        <CheckCircle className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-lg p-4 text-sm font-mono text-[var(--color-text-secondary)] overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  children,
  step
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  step: number;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 transition-all duration-normal hover:border-[var(--color-border-strong)]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-brand-500">Step {step}</span>
          </div>
          <h3 className="font-semibold text-lg mt-1">{title}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{description}</p>
        </div>
      </div>
      <div className="pl-14">{children}</div>
    </div>
  );
}

export default function OnboardingPage() {
  const params = useParams();
  const token = params.token as string;

  const appUrl = 'https://leadfast.raghavsathishmohan.com';
  const webhookUrl = `${appUrl}/api/lead-capture`;
  const forwardEmail = `leads+${token}@leadfast.raghavsathishmohan.com`;
  const dashboardUrl = `https://app.leadfast.raghavsathishmohan.com/d/${token}`;

  const embedCode = `<!-- LeadFast Lead Capture -->
<script src="${appUrl}/embed.js" data-token="${token}"></script>`;

  const apiExample = `fetch('${webhookUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: '${token}',
    body: 'Lead message text here...'
  })
});`;

  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const sendTestLead = async () => {
    setTestStatus('sending');
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          body: `Test lead from onboarding. Name: Demo Customer. Service: roofing inquiry. City: Austin. Phone: 555-123-4567. Email: demo@example.com.`,
        }),
      });
      if (res.ok) {
        setTestStatus('sent');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.svg" alt="" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">LeadFast</span>
          </a>
          <a
            href={dashboardUrl}
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors inline-flex items-center gap-1.5"
          >
            Skip to Dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 md:py-14 space-y-10">
        {/* Welcome */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-500/15 rounded-2xl flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            You are all set!
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
            Your LeadFast account is active. Here is how to start capturing leads from anywhere.
          </p>
        </div>

        {/* Test Lead CTA */}
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-semibold">Want to see it in action?</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Send yourself a test lead and check your email + dashboard.
            </p>
          </div>
          <button
            onClick={sendTestLead}
            disabled={testStatus === 'sending' || testStatus === 'sent'}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-normal shrink-0"
          >
            {testStatus === 'sending' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : testStatus === 'sent' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Test Sent!
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Send Test Lead
              </>
            )}
          </button>
        </div>

        {/* Integration Options */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Connect Your Leads</h2>

          {/* Option 1: Email Forwarding */}
          <IntegrationCard
            icon={Mail}
            step={1}
            title="Email Forwarding (Easiest)"
            description="Forward lead emails to your unique LeadFast address. We will parse and alert you automatically."
          >
            <CodeBlock
              label="Your Forwarding Address"
              code={forwardEmail}
            />
            <div className="mt-4 bg-[var(--color-elevated)] rounded-lg p-4 text-sm text-[var(--color-text-secondary)] space-y-2">
              <p className="font-medium text-[var(--color-text)]">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>When a lead emails you, forward it to the address above</li>
                <li>LeadFast AI parses the lead details</li>
                <li>You get an instant alert with a tap-to-call link</li>
              </ol>
            </div>
          </IntegrationCard>

          {/* Option 2: Embed Script */}
          <IntegrationCard
            icon={Globe}
            step={2}
            title="Website Embed"
            description="Add one line of code to your website to replace your contact form."
          >
            <CodeBlock
              label="Copy & Paste Into Your Site"
              code={embedCode}
            />
            <p className="text-xs text-[var(--color-text-tertiary)] mt-3">
              Place this just before the closing &lt;/body&gt; tag. The script automatically replaces your existing contact form and routes submissions to LeadFast.
            </p>
          </IntegrationCard>

          {/* Option 3: API / Webhook */}
          <IntegrationCard
            icon={Code}
            step={3}
            title="Developer API"
            description="POST leads directly from your app, CRM, or form builder."
          >
            <CodeBlock
              label="Webhook URL"
              code={webhookUrl}
            />
            <div className="mt-4">
              <CodeBlock
                label="JavaScript Example"
                code={apiExample}
              />
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-3">
              Works with Zapier, Make, HubSpot webhooks, WordPress, or any system that can POST JSON.
            </p>
          </IntegrationCard>
        </div>

        {/* Dashboard Link */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center space-y-4">
          <h3 className="font-semibold text-lg">Ready to manage your leads?</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your live dashboard is where you will track every lead, mark status, and get real-time updates.
          </p>
          <a
            href={dashboardUrl}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-8 py-3 font-semibold transition-all duration-normal hover:shadow-glow"
          >
            Open Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Help */}
        <div className="text-center pb-8">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Questions? Reach out at{' '}
            <a href="mailto:raghavsathishmohan@gmail.com" className="text-brand-500 hover:text-brand-400 transition-colors">
              raghavsathishmohan@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
