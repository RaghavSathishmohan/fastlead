'use client';

import { useFormState } from 'react-dom';
import { signupClient, SignupResult } from '@/app/actions/signup';
import { Zap, Clock, Mail, Shield, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';

const initialState: SignupResult = { success: false, message: '' };

export default function LandingPage() {
  const [state, formAction] = useFormState(signupClient, initialState);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-500" />
            <span className="font-bold text-lg">LeadFast</span>
          </div>
          <a
            href="#pricing"
            className="text-sm font-medium hover:text-brand-400 transition-colors"
          >
            Pricing
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 space-y-24">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Never Lose a Lead
            <br />
            <span className="text-brand-500">Again</span>
          </h1>
          <p className="text-lg text-[var(--color-muted)] max-w-xl mx-auto">
            AI instantly responds to every construction lead, alerts you within seconds,
            and tracks everything in a live mobile dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-6 py-3 font-medium transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 border border-[var(--color-border)] hover:bg-[var(--color-card)] rounded-xl px-6 py-3 font-medium transition-colors"
            >
              See How It Works
            </a>
          </div>
        </section>

        <section id="how" className="space-y-8">
          <h2 className="text-2xl font-bold text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: 'Lead Arrives',
                desc: 'A prospect fills out your form or sends an email. LeadFast captures it instantly.'
              },
              {
                icon: Zap,
                title: 'AI Responds',
                desc: 'Gemini Flash parses the lead details and sends a professional auto-reply to the customer.'
              },
              {
                icon: Clock,
                title: 'You Get Alerted',
                desc: 'You receive an instant email alert with all lead details and a tap-to-call link.'
              }
            ].map((step, i) => (
              <div key={i} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-3">
                <step.icon className="w-8 h-8 text-brand-500" />
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-[var(--color-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Simple Pricing</h2>
          <div className="max-w-sm mx-auto bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold">$197<span className="text-lg text-[var(--color-muted)]">/mo</span></div>
              <p className="text-sm text-[var(--color-muted)] mt-1">Beta pricing — lock it in forever</p>
            </div>
            <ul className="space-y-3">
              {[
                'Unlimited leads',
                'Instant email alerts',
                'AI auto-reply',
                'Live mobile dashboard',
                '90-day lead history',
                'No setup fees'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="block w-full text-center bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3 font-medium transition-colors"
            >
              Start Free Trial
            </a>
          </div>
        </section>

        <section id="contact" className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Get Started</h2>
          {state.success ? (
            <div className="max-w-md mx-auto bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
              <h3 className="font-semibold text-lg">Welcome to LeadFast</h3>
              <p className="text-[var(--color-muted)]">{state.message}</p>
              {state.dashboardUrl && (
                <a
                  href={state.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 font-medium"
                >
                  Open Your Dashboard
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <form action={formAction} className="max-w-md mx-auto space-y-4">
              <div className="space-y-1">
                <label htmlFor="company" className="text-sm font-medium">Company Name</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="Your Construction Company"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
              {state.message && (
                <p className="text-sm text-red-400">{state.message}</p>
              )}
              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3 font-medium transition-colors"
              >
                Create Account
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] mt-24">
        <div className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-[var(--color-muted)]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>LeadFast</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
