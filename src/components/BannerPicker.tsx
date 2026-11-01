"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BANNERS, BANNER_CATEGORIES, bannerClassName, bannerStyle, getBanner, getUnlockedBannerIds } from "@/data/banners";
import type { Category } from "@/data/titles";

const CATEGORY_LABELS: Record<Category, string> = {
  "film-tv": "film/tv",
  music: "music",
  anime: "anime",
  books: "books",
  games: "games",
};

/** Modal for the profile owner to pick a banner they have unlocked. */
export default function BannerPicker({
  selectedBanner,
  onClose,
}: {
  selectedBanner: string | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Category>(getBanner(selectedBanner)?.category ?? "film-tv");
  const [unlocked, setUnlocked] = useState<Set<string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users/titles")
      .then(res => res.json())
      .then(data => setUnlocked(getUnlockedBannerIds(data.unlockedByCategory)))
      .catch(() => setError("couldn't load your banners"));
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

  const choose = async (bannerId: string | null) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "failed to save banner");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message.toLowerCase() : "failed to save banner");
      setSaving(false);
    }
  };

  const banners = BANNERS.filter(b => b.category === tab);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="vv-shell vv-panel relative flex max-h-[min(92vh,760px)] w-full max-w-3xl flex-col overflow-hidden p-5 sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-modal-heading"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="banner-modal-heading" className="text-xl font-semibold tracking-tight lowercase">
              choose your banner
            </h2>
            <p className="mt-1 text-[13px] lowercase text-vv-muted">
              each title you unlock in a category unlocks that category&apos;s next banner.
            </p>
          </div>
          <button type="button" onClick={onClose} className="vv-icon-btn shrink-0" aria-label="close">
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-1" role="tablist" aria-label="banner categories">
          {BANNER_CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={tab === category}
              aria-current={tab === category ? "page" : undefined}
              className="vv-pill"
              onClick={() => setTab(category)}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-1">
          {!unlocked && !error ? (
            <p className="py-10 text-center text-sm lowercase text-vv-faint">loading banners...</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {banners.map(banner => {
                const isUnlocked = unlocked?.has(banner.id) ?? false;
                const isSelected = selectedBanner === banner.id;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    disabled={!isUnlocked || saving}
                    onClick={() => choose(banner.id)}
                    className={`group overflow-hidden rounded-xl border text-left transition-colors ${
                      isSelected ? "border-vv-fg" : "border-vv-line hover:border-vv-strong"
                    } disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`block h-20 ${bannerClassName(banner)} ${isUnlocked ? "" : "opacity-30 grayscale"}`}
                      style={bannerStyle(banner)}
                      aria-hidden="true"
                    />
                    <span className="flex items-center justify-between gap-2 px-3 py-2 text-[13px] lowercase">
                      <span className={isUnlocked ? "text-vv-fg" : "text-vv-faint"}>
                        {banner.tier}. {banner.unlockTitle}
                      </span>
                      <span className="shrink-0 text-vv-faint">
                        {isSelected ? "equipped" : isUnlocked ? "" : "locked"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-vv-line pt-4">
          <span className="text-xs lowercase text-red-500">{error}</span>
          {selectedBanner && (
            <button type="button" className="vv-btn" disabled={saving} onClick={() => choose(null)}>
              remove banner
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
