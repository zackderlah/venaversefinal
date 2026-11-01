"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_TITLES, GENERIC_TITLES, Category } from "@/data/titles";
import { FILM_TV_CATEGORY } from "@/lib/reviewCategories";

type TabId = Category | "generic";

const TABS: { id: TabId; label: string; dot: string }[] = [
  { id: "film-tv", label: "film/tv", dot: "bg-blue-500" },
  { id: "music", label: "music", dot: "bg-purple-500" },
  { id: "anime", label: "anime", dot: "bg-red-500" },
  { id: "books", label: "books", dot: "bg-green-500" },
  { id: "games", label: "games", dot: "bg-cyan-500" },
  { id: "generic", label: "generic", dot: "bg-yellow-500" },
];

// Reviews needed for each title tier (see src/data/titles.ts): 5 per category tier, 10 per generic tier.
const REVIEWS_PER_TIER: Record<TabId, number> = {
  "film-tv": 5,
  music: 5,
  anime: 5,
  books: 5,
  games: 5,
  generic: 10,
};

function normalizeTab(tab: string | null | undefined): TabId {
  if (!tab || tab === "film") return FILM_TV_CATEGORY as TabId;
  return tab as TabId;
}

/** Modal for the profile owner to pick which unlocked title appears next to their name. */
export default function TitlePicker({
  selectedTitle,
  selectedTitleCategory,
  onClose,
}: {
  selectedTitle: string | null;
  selectedTitleCategory: string | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabId>(normalizeTab(selectedTitleCategory));
  const [unlocked, setUnlocked] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users/titles")
      .then(res => res.json())
      .then(setUnlocked)
      .catch(() => setError("couldn't load your titles"));
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const choose = async (title: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category: tab }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "failed to set title");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message.toLowerCase() : "failed to set title");
      setSaving(false);
    }
  };

  const allTitles = tab === "generic" ? GENERIC_TITLES : CATEGORY_TITLES[tab];
  const unlockedTitles: string[] = unlocked
    ? (tab === "generic" ? unlocked.unlockedGeneric : unlocked.unlockedByCategory?.[tab]) ?? []
    : [];
  const currentTab = normalizeTab(selectedTitleCategory);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="vv-shell vv-panel relative flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col overflow-hidden p-5 sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="title-modal-heading"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="title-modal-heading" className="text-xl font-semibold tracking-tight lowercase">
              choose your title
            </h2>
            <p className="mt-1 text-[13px] lowercase text-vv-muted">
              write more reviews in a category to unlock its next title.
            </p>
          </div>
          <button type="button" onClick={onClose} className="vv-icon-btn shrink-0" aria-label="close">
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-1" role="tablist" aria-label="title categories">
          {TABS.map(({ id, label, dot }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-current={tab === id ? "page" : undefined}
              className="vv-pill"
              onClick={() => setTab(id)}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-1">
          {!unlocked && !error ? (
            <p className="py-10 text-center text-sm lowercase text-vv-faint">loading titles...</p>
          ) : (
            <ul className="divide-y divide-vv-line overflow-hidden rounded-xl border border-vv-line">
              {allTitles.map((title, i) => {
                const isUnlocked = unlockedTitles.includes(title);
                const isSelected = selectedTitle === title && currentTab === tab;
                return (
                  <li key={title}>
                    <button
                      type="button"
                      disabled={!isUnlocked || saving}
                      onClick={() => choose(title)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[14px] lowercase transition-colors ${
                        isUnlocked ? "hover:bg-vv-raised" : "cursor-not-allowed"
                      } ${isSelected ? "bg-vv-raised" : ""}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="w-5 shrink-0 text-[12px] text-vv-faint">{i + 1}</span>
                        <span className={`truncate ${isUnlocked ? "font-medium text-vv-fg" : "text-vv-faint"}`}>{title}</span>
                      </span>
                      <span className="shrink-0 text-[12px] text-vv-faint">
                        {isSelected ? "equipped" : isUnlocked ? "" : `${i * REVIEWS_PER_TIER[tab]} reviews`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && <p className="mt-4 text-xs lowercase text-red-500">{error}</p>}
      </div>
    </div>,
    document.body,
  );
}
