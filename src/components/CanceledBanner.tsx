'use client';

import { useSearchParams } from 'next/navigation';

export function CanceledBanner() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled') === '1';

  if (!canceled) return null;

  return (
    <div className="max-w-md mx-auto bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center text-sm text-yellow-400">
      Payment was canceled. Your account is pending. Complete payment below to activate.
    </div>
  );
}
