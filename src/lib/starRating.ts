/** Five-star scale with half-star steps (0.5 … 5). */

export const MIN_STARS = 0.5;
export const MAX_STARS = 5;

export function snapToHalfStar(n: number): number {
  const s = Math.round(n * 2) / 2;
  return Math.min(MAX_STARS, Math.max(MIN_STARS, s));
}

export function isValidFiveStarRating(n: number): boolean {
  if (!Number.isFinite(n) || n < MIN_STARS || n > MAX_STARS) return false;
  const doubled = n * 2;
  return Math.abs(doubled - Math.round(doubled)) < 1e-6;
}

export function formatStarRatingString(n: number): string {
  if (!Number.isFinite(n)) return '';
  const snapped = snapToHalfStar(n);
  if (Math.abs(snapped % 1) < 1e-6) return String(Math.round(snapped));
  return snapped.toFixed(1);
}

export function isRatingProvided(raw: unknown): boolean {
  if (raw === undefined || raw === null) return false;
  if (typeof raw === 'string') return raw.trim().length > 0;
  if (typeof raw === 'number') return Number.isFinite(raw);
  return String(raw).trim().length > 0;
}

export function parseFiveStarRating(
  raw: unknown
): { ok: true; value: number } | { ok: false; message: string } {
  let n: number | null = null;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    n = raw;
  } else if (typeof raw === 'string') {
    const t = raw.trim();
    if (t === '') return { ok: false, message: 'invalid rating' };
    const p = parseFloat(t);
    n = Number.isFinite(p) ? p : null;
  } else {
    const p = parseFloat(String(raw));
    n = Number.isFinite(p) ? p : null;
  }
  if (n == null) return { ok: false, message: 'invalid rating' };
  const normalized =
    n > MAX_STARS && n <= 10 ? legacyTenPointToFiveStars(n) : n;
  if (!isValidFiveStarRating(normalized)) {
    return { ok: false, message: 'rating must be from 0.5 to 5 stars, in half-star steps' };
  }
  return { ok: true, value: normalized };
}

/** Maps legacy 1–10 scores to 5-star half steps (for migrations / one-off scripts). */
export function legacyTenPointToFiveStars(ten: number): number {
  if (!Number.isFinite(ten)) return MIN_STARS;
  const onFive = Math.round((ten / 2) * 2) / 2;
  return Math.min(MAX_STARS, Math.max(MIN_STARS, onFive));
}

/**
 * Values still stored on the old 1–10 scale (e.g. 9) must be converted for display.
 * After migration, stored values are ≤5; unmigrated rows can still be 6–10.
 * Do not use for values that are already on the 5-star scale (always ≤5).
 */
export function normalizeRatingFromStorage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > MAX_STARS && value <= 10) {
    return legacyTenPointToFiveStars(value);
  }
  return Math.min(MAX_STARS, Math.max(0, value));
}

/** Coerce DB/API values (including legacy 1–10) into a half-star string for controlled inputs. */
export function normalizeRatingStringForForm(raw: unknown): string {
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '').trim());
  if (!Number.isFinite(n)) return '';
  const v = normalizeRatingFromStorage(n);
  if (v < MIN_STARS || !isValidFiveStarRating(v)) return '';
  return formatStarRatingString(v);
}
