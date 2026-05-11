'use client';

import { useFormState } from 'react-dom';
import { authenticateAdmin, deleteClient, AdminResult, getAdminStats, getClientDetail, getRecentActivity, ClientDetail as ClientDetailType, ActivityItem } from '@/app/actions/admin';
import { Shield, ExternalLink, Copy, CheckCircle, Trash2, AlertTriangle, Users, BarChart3, Zap, Activity } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { StatsCards } from '@/components/admin/StatsCards';
import { ClientDetail } from '@/components/admin/ClientDetail';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { AdminHealthDashboard } from '@/components/admin/AdminHealthDashboard';

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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-xl p-6 max-w-sm w-full mx-4 space-y-5">
        <div className="flex items-center gap-3 text-red-400">
          <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">Delete Client</h3>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Are you sure you want to delete <strong className="text-[var(--color-text)]">{clientName}</strong>? This will also delete all their leads and cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-hover)] transition-colors"
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
  const [stats, setStats] = useState<{ totalClients: number; activeClients: number; leadsThisMonth: number; totalLeads: number } | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [clientDetail, setClientDetail] = useState<ClientDetailType | null>(null);
  const [activeTab, setActiveTab] = useState<'clients' | 'activity' | 'health'>('clients');

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

  // Load stats and activity after auth
  useEffect(() => {
    if (!authState.success || !password) return;

    getAdminStats(password)
      .then(setStats)
      .catch(() => setStats(null));

    getRecentActivity(password, 20)
      .then(setActivity)
      .catch(() => setActivity([]));
  }, [authState.success, password]);

  const handleDelete = (clientId: string) => {
    const formData = new FormData();
    formData.append('password', password);
    formData.append('clientId', clientId);
    deleteAction(formData);
    setDeleteConfirm(null);
  };

  const openClientDetail = useCallback(async (clientId: string) => {
    if (!password) return;
    try {
      const detail = await getClientDetail(password, clientId);
      if (detail) setClientDetail(detail);
    } catch {
      // ignore
    }
  }, [password]);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 glass border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center gap-2.5">
          <img src="/logo-icon.svg" alt="" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight">LeadFast Admin</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 md:py-14">
        {!authState.success ? (
          <form action={authAction} className="max-w-sm mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-brand-500/15 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7 text-brand-500" />
              </div>
              <h1 className="text-2xl font-bold">Admin Access</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">Enter your password to manage clients.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
                placeholder="Enter admin password"
              />
            </div>
            {authState.message && (
              <p className="text-sm text-red-400">{authState.message}</p>
            )}
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3 font-semibold transition-all duration-normal hover:shadow-glow"
            >
              Sign In
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {stats && <StatsCards {...stats} />}

            <div className="flex gap-1 bg-[var(--color-elevated)] rounded-xl p-1 w-fit">
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'clients'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                <Users className="w-4 h-4" />
                Clients
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'activity'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                <Zap className="w-4 h-4" />
                Activity
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'health'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                <Activity className="w-4 h-4" />
                Health
              </button>
            </div>

            {deleteState.message && (
              <p className={deleteState.success ? 'text-sm text-green-400' : 'text-sm text-red-400'}>
                {deleteState.message}
              </p>
            )}

            {activeTab === 'clients' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    <h2 className="text-xl font-bold tracking-tight">Clients</h2>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)]">
                    {clients?.length || 0} total
                  </span>
                </div>

                {clients && clients.length > 0 ? (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <ClientTable
                      clients={clients}
                      onDelete={(id, name) => setDeleteConfirm({ id, name })}
                      onDetail={(id) => openClientDetail(id)}
                    />
                  </div>
                ) : (
                  <div className="text-center py-16 text-[var(--color-text-secondary)]">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No clients yet.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'activity' && (
              <>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
                </div>
                <ActivityFeed items={activity} />
              </>
            )}

            {activeTab === 'health' && <AdminHealthDashboard />}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteConfirm}
        clientName={deleteConfirm?.name || ''}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
      />

      {clientDetail && (
        <ClientDetail client={clientDetail} onClose={() => setClientDetail(null)} />
      )}
    </div>
  );
}

function ClientTable({
  clients,
  onDelete,
  onDetail,
}: {
  clients: NonNullable<AdminResult['clients']>;
  onDelete: (id: string, name: string) => void;
  onDetail: (id: string) => void;
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
          <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-left">
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Name</th>
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Company</th>
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Email</th>
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Phone</th>
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Status</th>
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Dashboard</th>
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Created</th>
            <th className="py-3.5 px-4 font-medium text-xs uppercase tracking-wider" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {clients.map((client) => {
            const dashboardUrl = `https://app.leadfast.raghavsathishmohan.com/d/${client.token}`;
            return (
              <tr
                key={client.id}
                className="hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                onClick={() => onDetail(client.id)}
              >
                <td className="py-3.5 px-4 font-medium">{client.name}</td>
                <td className="py-3.5 px-4">{client.company_name}</td>
                <td className="py-3.5 px-4">{client.owner_email}</td>
                <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">{client.owner_phone || '—'}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active'
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                        : client.status === 'pending'
                          ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {client.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-500 hover:text-brand-400 inline-flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLink(dashboardUrl, client.token);
                      }}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors p-1 rounded-md hover:bg-[var(--color-surface-hover)]"
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
                <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                  {new Date(client.created_at).toLocaleDateString()}
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(client.id, client.name);
                    }}
                    className="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10"
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
