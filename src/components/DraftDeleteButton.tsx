'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DraftDeleteButton({
  draftId,
  onDeleted,
}: {
  draftId: number;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm('delete this draft?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/drafts/${draftId}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted?.();
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="lowercase text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
    >
      {busy ? '…' : 'delete'}
    </button>
  );
}
