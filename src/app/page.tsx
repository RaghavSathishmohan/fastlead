'use client';

import { useFormState } from 'react-dom';
import { useEffect, Suspense } from 'react';
import { signupClient, SignupResult } from '@/app/actions/signup';
import { CanceledBanner } from '@/components/CanceledBanner';
import {
  Zap,
  Clock,
  Mail,
  Shield,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  CreditCard,
  MessageSquare,
  BarChart3,
  Smartphone
} from 'lucide-react';

const initialState: SignupResult = { success: false, message: '' };

export default function LandingPage() {
  const [state, formAction] = useFormState(signupClient, initialState);

  useEffect(() => {
    if (state.onboardingUrl) {
      window.location.href = state.onboardingUrl;
    }
    if (state.checkoutUrl) {
      window.location.href = state.checkoutUrl;
    }
  }, [state.onboardingUrl, state.checkoutUrl]);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.svg" alt="" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">LeadFast</span>
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-fast"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-fast"
            >
              Pricing
            </a>
            <a
              href="#signup"
              className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-lg px-4 py-2 transition-colors duration-fast"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px]" />
          </div>
          <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-medium text-brand-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
                Built for contractors
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                Never Lose a Lead
                <br />
                <span className="gradient-text">Again</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
                AI instantly responds to every construction lead, alerts you within seconds, and tracks everything in a live mobile dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <a
                  href="#signup"
                  className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-8 py-3.5 font-semibold transition-all duration-normal hover:shadow-glow"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] rounded-xl px-8 py-3.5 font-medium transition-all duration-normal"
                >
                  See How It Works
                </a>
              </div>

              <p className="text-xs text-[var(--color-text-tertiary)]">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works — Bento Grid */}
        <section id="how" className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-4 text-[var(--color-text-secondary)] max-w-md mx-auto">
                Three simple steps to never miss another opportunity.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: Mail,
                  title: 'Lead Arrives',
                  desc: 'A prospect fills out your form or sends an email. LeadFast captures it instantly.',
                  accent: 'bg-blue-500/15 text-blue-400'
                },
                {
                  icon: MessageSquare,
                  title: 'AI Responds',
                  desc: 'Gemini Flash parses the lead details and sends a professional auto-reply to the customer.',
                  accent: 'bg-brand-500/15 text-brand-400'
                },
                {
                  icon: Smartphone,
                  title: 'You Get Alerted',
                  desc: 'You receive an instant email alert with all lead details and a tap-to-call link.',
                  accent: 'bg-green-500/15 text-green-400'
                }
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-xl p-6 space-y-4 transition-all duration-normal hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`w-11 h-11 rounded-lg ${step.accent} flex items-center justify-center`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4 text-5xl font-bold text-[var(--color-text)]/[0.03] select-none">
                    0{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-28 border-y border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need</h2>
              <p className="mt-4 text-[var(--color-text-secondary)] max-w-md mx-auto">
                Built from the ground up for busy contractors who cannot afford to miss leads.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Clock, title: 'Instant Response', desc: 'Sub-second AI reply to every inquiry' },
                { icon: BarChart3, title: 'Live Dashboard', desc: 'Track leads in real time from any device' },
                { icon: Shield, title: 'Secure & Private', desc: 'Encrypted data, no shared credentials' },
                { icon: CheckCircle, title: '90-Day History', desc: 'Review every lead, every conversation' }
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl p-5 space-y-3 transition-all duration-normal hover:border-[var(--color-border-strong)]"
                >
                  <f.icon className="w-5 h-5 text-brand-500" />
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple Pricing</h2>
              <p className="mt-4 text-[var(--color-text-secondary)] max-w-md mx-auto">
                One flat rate. No hidden fees. No surprises.
              </p>
            </div>
            <div className="max-w-sm mx-auto">
              <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 space-y-8">
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold tracking-tight">
                    $197<span className="text-xl text-[var(--color-text-secondary)] font-medium">/mo</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Beta pricing — lock it in forever</p>
                </div>
                <ul className="space-y-3.5">
                  {[
                    'Unlimited leads',
                    'Instant email alerts',
                    'AI auto-reply',
                    'Live mobile dashboard',
                    '90-day lead history',
                    'No setup fees'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4.5 h-4.5 text-brand-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#signup"
                  className="block w-full text-center bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3.5 font-semibold transition-all duration-normal hover:shadow-glow"
                >
                  Start Free Trial
                </a>
                <p className="text-center text-xs text-[var(--color-text-tertiary)]">
                  Secured by Stripe. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Signup */}
        <section id="signup" className="py-20 md:py-28 border-t border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Get Started</h2>
                <p className="mt-4 text-[var(--color-text-secondary)]">
                  Create your account in under a minute.
                </p>
              </div>

              <Suspense fallback={null}>
                <CanceledBanner />
              </Suspense>

              {state.success ? (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 space-y-5 text-center">
                  {state.dashboardUrl ? (
                    <>
                      <div className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-7 h-7 text-green-400" />
                      </div>
                      <h3 className="font-semibold text-xl">Welcome to LeadFast</h3>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-brand-500/15 rounded-full flex items-center justify-center mx-auto">
                        <CreditCard className="w-7 h-7 text-brand-500" />
                      </div>
                      <h3 className="font-semibold text-xl">Complete Your Payment</h3>
                    </>
                  )}
                  <p className="text-[var(--color-text-secondary)]">{state.message}</p>
                  {state.checkoutUrl && (
                    <a
                      href={state.checkoutUrl}
                      className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-8 py-3 font-semibold transition-all duration-normal hover:shadow-glow"
                    >
                      Pay $197/mo
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {state.dashboardUrl && (
                    <a
                      href={state.dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 font-semibold transition-colors"
                    >
                      Open Your Dashboard
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ) : (
                <form action={formAction} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="company" className="text-sm font-medium">Company Name</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
                      placeholder="Your Construction Company"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="discount_code" className="text-sm font-medium">Discount Code (optional)</label>
                    <input
                      id="discount_code"
                      name="discount_code"
                      type="text"
                      className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
                      placeholder="Enter code if you have one"
                    />
                  </div>
                  {state.message && (
                    <p className="text-sm text-red-400">{state.message}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3.5 font-semibold transition-all duration-normal hover:shadow-glow"
                  >
                    Create Account
                  </button>
                  <p className="text-center text-xs text-[var(--color-text-tertiary)]">
                    By signing up, you agree to our Terms and Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-[var(--color-text-tertiary)]">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.svg" alt="" className="w-6 h-6" />
            <span className="font-medium text-[var(--color-text-secondary)]">LeadFast</span>
          </a>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
