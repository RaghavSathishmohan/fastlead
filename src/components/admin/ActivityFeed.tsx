'use client';

import { ActivityItem } from '@/app/actions/admin';
import { Zap, Clock } from 'lucide-react';

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const urgencyDot = (urgency: string) => {
    if (urgency === 'high') return 'bg-red-500';
    if (urgency === 'medium') return 'bg-yellow-400';
    return 'bg-[var(--color-text-tertiary)]';
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      called: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
      won: 'bg-green-500/15 text-green-400 border-green-500/20',
      lost: 'bg-red-500/15 text-red-400 border-red-500/20',
      duplicate: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    };
    return map[status] || map.new;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--color-text-secondary)]">
        <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-xl px-4 py-3 transition-all"
        >
          <span className={`shrink-0 w-2 h-2 rounded-full ${urgencyDot(item.urgency)}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{item.name}</span>
              <span
                className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge(item.status)}`}
              >
                {item.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
              <span>{item.service}</span>
              <span>·</span>
              <span>{item.client_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] shrink-0">
            <Clock className="w-3 h-3" />
            {timeAgo(item.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
}
