/** Stored value for film + TV reviews (URL path remains /films). */
export const FILM_TV_CATEGORY = 'film-tv';

export const STORED_REVIEW_CATEGORIES = [
  FILM_TV_CATEGORY,
  'music',
  'anime',
  'books',
  'games',
  'other',
] as const;

export type StoredReviewCategory = (typeof STORED_REVIEW_CATEGORIES)[number];

/** Map client/legacy values to the value we persist. */
export function normalizeReviewCategoryInput(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let c = raw.trim();
  if (c === 'album') c = 'music';
  if (c === 'film') c = FILM_TV_CATEGORY;
  if ((STORED_REVIEW_CATEGORIES as readonly string[]).includes(c)) return c;
  return null;
}

export function isFilmTvReviewCategory(c: string | undefined | null): boolean {
  return c === FILM_TV_CATEGORY || c === 'film';
}

export function reviewsListPathForCategory(category: string): string {
  if (isFilmTvReviewCategory(category)) return '/films';
  return `/${category}`;
}
