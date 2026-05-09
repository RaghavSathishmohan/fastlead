'use client';

import { useFormState } from 'react-dom';
import { authenticateAdmin, AdminResult } from '@/app/actions/admin';
import { Shield, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const initialState: AdminResult = { success: false, message: '' };

function ClientTable({ clients }: { clients: NonNullable<AdminResult['clients']> }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (url: string, token: string) => {
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)] text-left">
            <th className="py-3 px-4 font-medium">Name</th>
            <th className="py-3 px-4 font-medium">Company</th>
            <th className="py-3 px-4 font-medium">Email</th>
            <th className="py-3 px-4 font-medium">Phone</th>
            <th className="py-3 px-4 font-medium">Dashboard</th>
            <th className="py-3 px-4 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {clients.map((client) => {
            const dashboardUrl = `https://app.leadfast.raghavsathishmohan.com/d/${client.token}`;
            return (
              <tr key={client.id} className="hover:bg-[var(--color-card)] transition-colors">
                <td className="py-3 px-4">{client.name}</td>
                <td className="py-3 px-4">{client.company_name}</td>
                <td className="py-3 px-4">{client.owner_email}</td>
                <td className="py-3 px-4">{client.owner_phone || '—'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:text-brand-400 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </a>
                    <button
                      onClick={() => copyLink(dashboardUrl, client.token)}
                      className="text-[var(--color-muted)] hover:text-white transition-colors"
                      title="Copy dashboard link"
                    >
                      {copied === client.token ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-[var(--color-muted)]">
                  {new Date(client.created_at).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [state, formAction] = useFormState(authenticateAdmin, initialState);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-500" />
          <span className="font-bold">LeadFast Admin</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {!state.success ? (
          <form action={formAction} className="max-w-sm mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-center">Admin Access</h1>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Enter admin password"
              />
            </div>
            {state.message && (
              <p className="text-sm text-red-400">{state.message}</p>
            )}
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3 font-medium transition-colors"
            >
              Sign In
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Clients</h1>
              <span className="text-sm text-[var(--color-muted)]">{state.clients?.length || 0} total</span>
            </div>
            {state.clients && state.clients.length > 0 ? (
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">
                <ClientTable clients={state.clients} />
              </div>
            ) : (
              <p className="text-[var(--color-muted)]">No clients yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
