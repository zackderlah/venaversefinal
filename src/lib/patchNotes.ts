/**
 * Site patch notes for the homepage (newest first).
 */

export type PatchVersion = {
  id: string;
  dateISO: string;
  /** One bullet per line; keep lowercase to match site copy */
  items: string[];
};

/** Newest first. Add a version when you ship notable site changes. */
export const PATCH_VERSIONS: PatchVersion[] = [
  {
    id: '2026-04-09',
    dateISO: '2026-04-09',
    items: [
      'rating system migrated from /10 to 5 stars with half-star support.',
      'existing review and draft ratings converted to the new scale.',
      'new interactive star input for create/edit forms with stricter validation.',
      'star rendering rebuilt for exact half-star fill and cleaner unfilled stars.',
      'review cards now have stronger hover feedback with lift, shadow, and image zoom.',
      'added password recovery flow with reset-link tokens and reset pages.',
    ],
  },
  {
    id: '2026-02-10',
    dateISO: '2026-02-10',
    items: [
      'clearer profile pages and community listing.',
      'search and category browsing refinements.',
    ],
  },
];

export const PATCH_NOTES_COPY = {
  sectionTitle: 'patch notes',
  latestIntro: 'latest updates',
  viewAll: 'view all updates',
  modalTitle: 'patch notes',
  modalSubtitle: 'notable changes to the site.',
  close: 'close',
} as const;

export function formatPatchDate(dateISO: string): string {
  const d = new Date(`${dateISO}T12:00:00`);
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
      .format(d)
      .toLowerCase();
  } catch {
    return dateISO;
  }
}
