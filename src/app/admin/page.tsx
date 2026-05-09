'use client';

import { useFormState } from 'react-dom';
import { authenticateAdmin, deleteClient, AdminResult } from '@/app/actions/admin';
import { Shield, ExternalLink, Copy, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const initialState: AdminResult = { success: false, message: '' };

function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  clientName
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  clientName: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="font-semibold text-lg">Delete Client</h3>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Are you sure you want to delete <strong className="text-white">{clientName}</strong>? This will also delete all their leads and cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authState, authAction] = useFormState(authenticateAdmin, initialState);
  const [deleteState, deleteAction] = useFormState(deleteClient, initialState);

  const [clients, setClients] = useState<AdminResult['clients']>([]);
  const [password, setPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (authState.success && authState.clients) {
      setClients(authState.clients);
    }
  }, [authState.success, authState.clients]);

  useEffect(() => {
    if (deleteState.success && deleteState.clients) {
      setClients(deleteState.clients);
    }
  }, [deleteState.success, deleteState.clients]);

  const handleDelete = (clientId: string) => {
    const formData = new FormData();
    formData.append('password', password);
    formData.append('clientId', clientId);
    deleteAction(formData);
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-500" />
          <span className="font-bold">LeadFast Admin</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {!authState.success ? (
          <form action={authAction} className="max-w-sm mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-center">Admin Access</h1>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Enter admin password"
              />
            </div>
            {authState.message && (
              <p className="text-sm text-red-400">{authState.message}</p>
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
              <span className="text-sm text-[var(--color-muted)]">{clients?.length || 0} total</span>
            </div>

            {deleteState.message && (
              <p className={deleteState.success ? 'text-sm text-green-400' : 'text-sm text-red-400'}>
                {deleteState.message}
              </p>
            )}

            {clients && clients.length > 0 ? (
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">
                <ClientTable
                  clients={clients}
                  onDelete={(id, name) => setDeleteConfirm({ id, name })}
                />
              </div>
            ) : (
              <p className="text-[var(--color-muted)]">No clients yet.</p>
            )}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteConfirm}
        clientName={deleteConfirm?.name || ''}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
      />
    </div>
  );
}

function ClientTable({
  clients,
  onDelete
}: {
  clients: NonNullable<AdminResult['clients']>;
  onDelete: (id: string, name: string) => void;
}) {
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
            <th className="py-3 px-4 font-medium" />
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
                <td className="py-3 px-4">
                  <button
                    onClick={() => onDelete(client.id, client.name)}
                    className="text-[var(--color-muted)] hover:text-red-400 transition-colors"
                    title="Delete client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
