// Titles and unlock logic derived from TITLES.md

export type Category = 'film' | 'music' | 'anime' | 'books';

export const CATEGORY_TITLES: Record<Category, string[]> = {
  film: [
    'Film Rookie',
    'Movie Enjoyer',
    'Cinema Enthusiast',
    'Cinephile',
    'TV Authority',
    'Scene Specialist',
    'Cinematic Virtuoso',
    'Screen Overlord',
    'Master of Film',
    'Film GOD',
  ],
  music: [
    'Music Rookie',
    'Music Enjoyer',
    'Sound Enthusiast',
    'Sound Scholar',
    'Rhythm Responder',
    'Memories Of Melody',
    'Audio Authority',
    'Sound Overlord',
    'Master of Music',
    'Music GOD',
  ],
  anime: [
    'Anime Rookie',
    'Anime Enjoyer',
    'Animation Enthusiast',
    'Weeb',
    'Animation Authority',
    'Sakuga Senpai',
    'Sakuga Scholar',
    '2D Overlord',
    'Master of Anime',
    'Anime GOD',
  ],
  books: [
    'Book Rookie',
    'Page Turner',
    'Literature Enthusiast',
    'Bookworm',
    'Narrative Authority',
    'Literary Scholar',
    'Printed Word Virtuoso',
    'Tome Overseer',
    'Master of Literature',
    'Book GOD',
  ],
};

export const GENERIC_TITLES = [
  'New Reviewer',
  'Casual Critic',
  'Media Enthusiast',
  'Opinion Haver',
  'Review Brah',
  'Critique Guy',
  'Digital Culture Commentator',
  'Content Scholar',
  'Media Archivist',
  'Master of Media',
  'Piero Scaruffi',
];

// Returns the unlocked title index (0-based) for a given review count
export function getTitleIndexForCategory(count: number): number {
  return Math.min(Math.floor(count / 5), 9);
}

// Returns the unlocked generic title index (0-based) for total review count
export function getGenericTitleIndex(total: number): number {
  return Math.min(Math.floor(total / 5), 10);
}

// Returns the unlocked titles for a user given their review counts by category
export function getUnlockedTitlesByCategory(reviewCounts: Partial<Record<Category, number>>) {
  const unlocked: Record<Category, string[]> = {
    film: [], music: [], anime: [], books: []
  };
  for (const cat of Object.keys(CATEGORY_TITLES) as Category[]) {
    const count = reviewCounts[cat] || 0;
    const idx = getTitleIndexForCategory(count);
    unlocked[cat] = CATEGORY_TITLES[cat].slice(0, idx + 1);
  }
  return unlocked;
}

// Returns the unlocked generic titles for a user given their total review count
export function getUnlockedGenericTitles(total: number) {
  const idx = getGenericTitleIndex(total);
  return GENERIC_TITLES.slice(0, idx + 1);
} 