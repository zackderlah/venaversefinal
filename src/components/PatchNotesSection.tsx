'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PATCH_VERSIONS, PATCH_NOTES_COPY, formatPatchDate } from '@/lib/patchNotes';

export default function PatchNotesSection() {
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  const latest = PATCH_VERSIONS[0];
  const t = PATCH_NOTES_COPY;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => {
      closeBtnRef.current?.focus({ preventScroll: true });
    });
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /** Lock scroll without shifting layout (scrollbar gutter) or changing scroll position. */
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!latest) return null;

  const latestDate = formatPatchDate(latest.dateISO);

  return (
    <div className="mt-6 pt-6 border-t border-black/20 dark:border-gray-100/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-[1.575rem] font-black tracking-tight lowercase text-black dark:text-gray-100 leading-tight">
              {t.sectionTitle}
            </h3>
            <span className="text-[0.7875rem] lowercase leading-relaxed text-gray-500 dark:text-gray-400">
              {latestDate}
            </span>
          </div>
          <p className="text-[0.7875rem] font-normal lowercase leading-relaxed text-gray-600 dark:text-gray-300">
            {t.latestIntro}
          </p>
          <ul className="list-disc space-y-1.5 pl-4 text-[0.7875rem] lowercase leading-relaxed text-gray-600 dark:text-gray-300">
            {latest.items.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="shrink-0 sm:pt-0.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[0.7875rem] lowercase text-black underline decoration-black/40 underline-offset-2 transition-opacity hover:opacity-70 dark:text-gray-100 dark:decoration-white/40"
          >
            {t.viewAll}
          </button>
        </div>
      </div>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70" aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              className="relative z-10 flex max-h-[min(85vh,28rem)] w-full max-w-md flex-col overflow-hidden rounded-lg border-2 border-black bg-white shadow-xl dark:border-gray-100 dark:bg-gray-950"
            >
              <div className="flex shrink-0 items-start justify-between gap-2 border-b-2 border-black px-3 py-2.5 dark:border-gray-100">
                <div>
                  <h2
                    id={titleId}
                    className="text-[1.575rem] font-black tracking-tight lowercase leading-tight text-black dark:text-gray-100"
                  >
                    {t.modalTitle}
                  </h2>
                  <p
                    id={descId}
                    className="mt-1.5 text-[0.7875rem] lowercase leading-relaxed text-gray-600 dark:text-gray-300"
                  >
                    {t.modalSubtitle}
                  </p>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 border-2 border-black px-2 py-1 text-[0.7875rem] lowercase tracking-tight transition-opacity hover:opacity-70 dark:border-gray-100"
                >
                  {t.close}
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-3">
                {PATCH_VERSIONS.map((v) => (
                  <article key={v.id}>
                    <h3 className="mb-2 text-[1.05rem] font-black tracking-tight lowercase leading-tight text-gray-600 dark:text-gray-400">
                      {formatPatchDate(v.dateISO)}
                    </h3>
                    <ul className="list-disc space-y-1.5 pl-4 text-[0.7875rem] lowercase leading-relaxed text-gray-600 dark:text-gray-300">
                      {v.items.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
