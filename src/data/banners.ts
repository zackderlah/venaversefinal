// Profile banners. Each category title unlocks the banner at the same tier,
// so a user who has unlocked "Cinephile" (film/tv tier 4) can use film/tv banners 1–4.

import type { CSSProperties } from 'react';
import { CATEGORY_TITLES, Category } from './titles';

export interface Banner {
  /** Stable id stored on the user, e.g. "music-4". */
  id: string;
  category: Category;
  /** 1–10, matching the title's position in CATEGORY_TITLES. */
  tier: number;
  /** The title that unlocks this banner (also used as its display name). */
  unlockTitle: string;
  /**
   * Optional artwork in /public/banners. When set it is drawn under the
   * generated pattern; leave unset to use the pattern alone.
   */
  image?: string;
}

// Deep, mid and light shades per category, matching the nav dots.
const PALETTES: Record<Category, [string, string, string]> = {
  'film-tv': ['#1d4ed8', '#3b82f6', '#93c5fd'],
  music: ['#6d28d9', '#a855f7', '#e9d5ff'],
  anime: ['#be123c', '#f43f5e', '#fda4af'],
  books: ['#047857', '#10b981', '#a7f3d0'],
  games: ['#0e7490', '#06b6d4', '#a5f3fc'],
};

export const BANNER_CATEGORIES = Object.keys(CATEGORY_TITLES) as Category[];

/**
 * Artwork for specific banners, keyed by banner id. Put files in /public/banners, e.g.
 *   'music-10': '/banners/music-10.jpg',
 * Banners without an entry use their generated pattern alone.
 */
const BANNER_IMAGES: Partial<Record<string, string>> = {};

export const BANNERS: Banner[] = BANNER_CATEGORIES.flatMap(category =>
  CATEGORY_TITLES[category].map((unlockTitle, i) => ({
    id: `${category}-${i + 1}`,
    category,
    tier: i + 1,
    unlockTitle,
    image: BANNER_IMAGES[`${category}-${i + 1}`],
  })),
);

const BANNERS_BY_ID = new Map(BANNERS.map(b => [b.id, b]));

export function getBanner(id: string | null | undefined): Banner | undefined {
  return id ? BANNERS_BY_ID.get(id) : undefined;
}

/** Banner ids unlocked by the given unlocked titles (from getUnlockedTitlesByCategory). */
export function getUnlockedBannerIds(unlockedByCategory: Record<Category, string[]>): Set<string> {
  const ids = new Set<string>();
  for (const category of BANNER_CATEGORIES) {
    const count = unlockedByCategory[category]?.length ?? 0;
    for (let tier = 1; tier <= count; tier++) ids.add(`${category}-${tier}`);
  }
  return ids;
}

/** Generated artwork: each tier layers on more detail than the last. */
function patternFor(category: Category, tier: number): string {
  const [c1, c2, c3] = PALETTES[category];
  switch (tier) {
    case 1:
      return `linear-gradient(135deg, ${c1}55 0%, transparent 70%)`;
    case 2:
      return `linear-gradient(120deg, ${c1}99 0%, ${c2}33 55%, transparent 100%)`;
    case 3:
      return `radial-gradient(circle at 20% 30%, ${c2}88, transparent 55%), linear-gradient(135deg, ${c1}55, transparent 80%)`;
    case 4:
      return [
        `linear-gradient(${c3}1f 1px, transparent 1px) 0 0 / 28px 28px`,
        `linear-gradient(90deg, ${c3}1f 1px, transparent 1px) 0 0 / 28px 28px`,
        `radial-gradient(ellipse at 80% 0%, ${c2}88, transparent 60%)`,
        `linear-gradient(135deg, ${c1}66, transparent 75%)`,
      ].join(', ');
    case 5:
      return [
        `radial-gradient(${c3}40 1.2px, transparent 1.6px) 0 0 / 16px 16px`,
        `radial-gradient(circle at 75% 40%, ${c2}99, transparent 50%)`,
        `linear-gradient(160deg, ${c1}77, transparent 70%)`,
      ].join(', ');
    case 6:
      return [
        `repeating-linear-gradient(135deg, ${c2}2a 0 2px, transparent 2px 14px)`,
        `linear-gradient(120deg, ${c1}bb, ${c2}55 60%, transparent)`,
      ].join(', ');
    case 7:
      return [
        `radial-gradient(ellipse at 10% 20%, ${c2}bb, transparent 50%)`,
        `radial-gradient(ellipse at 60% 90%, ${c1}dd, transparent 55%)`,
        `radial-gradient(ellipse at 92% 10%, ${c3}77, transparent 45%)`,
      ].join(', ');
    case 8:
      return [
        `radial-gradient(circle at 70% 45%, transparent 0 18%, ${c3}22 18.5% 19%, transparent 19.5% 30%, ${c3}1a 30.5% 31%, transparent 31.5%)`,
        `conic-gradient(from 210deg at 70% 45%, ${c1}dd, ${c2}99, ${c3}66, ${c1}dd)`,
      ].join(', ');
    case 9:
      return [
        `linear-gradient(${c3}26 1px, transparent 1px) 0 0 / 22px 22px`,
        `linear-gradient(90deg, ${c3}26 1px, transparent 1px) 0 0 / 22px 22px`,
        `radial-gradient(ellipse at 15% 15%, ${c3}99, transparent 45%)`,
        `radial-gradient(ellipse at 85% 85%, ${c2}cc, transparent 50%)`,
        `linear-gradient(135deg, ${c1}ee, ${c1}88)`,
      ].join(', ');
    default:
      // Tier 10 ("GOD"): animated shimmer, see .vv-banner-shimmer.
      return [
        `radial-gradient(#ffffff55 1px, transparent 1.6px) 0 0 / 24px 24px`,
        `linear-gradient(110deg, ${c1}, ${c2}, ${c3}, ${c2}, ${c1}) 0 0 / 300% 100%`,
      ].join(', ');
  }
}

export function bannerStyle(banner: Banner): CSSProperties {
  const pattern = patternFor(banner.category, banner.tier);
  return {
    background: banner.image ? `${pattern}, url(${banner.image}) center / cover no-repeat` : pattern,
  };
}

/** Tier 10 banners animate. */
export function bannerClassName(banner: Banner): string {
  return banner.tier === 10 ? 'vv-banner-shimmer' : '';
}
