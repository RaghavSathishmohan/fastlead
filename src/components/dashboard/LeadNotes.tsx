'use client';

import { useState } from 'react';
import { updateLeadNotes } from '@/lib/supabase';
import { StickyNote, Save } from 'lucide-react';

interface LeadNotesProps {
  leadId: string;
  notes: string | null;
  onUpdate: (leadId: string, notes: string | null) => void;
}

export function LeadNotes({ leadId, notes, onUpdate }: LeadNotesProps) {
  const [value, setValue] = useState(notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = value.trim() || null;
    if (trimmed === notes) return;

    setIsSaving(true);
    const success = await updateLeadNotes(leadId, trimmed);
    if (success) {
      onUpdate(leadId, trimmed);
    }
    setIsSaving(false);
  };

  const hasNotes = !!notes;

  return (
    <div className="space-y-2">
      <button
        onClick={() => {
          const el = document.getElementById(`notes-${leadId}`);
          el?.classList.toggle('hidden');
        }}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        <StickyNote className="w-3 h-3" />
        {hasNotes ? 'View / Edit Notes' : 'Add Notes'}
      </button>

      <div id={`notes-${leadId}`} className="hidden space-y-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          placeholder="Call notes, follow-up details, etc..."
          className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-lg p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:border-[var(--color-border-strong)]"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {isSaving ? 'Saving...' : 'Auto-saves on blur'}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs hover:border-[var(--color-border-strong)] transition-colors disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
