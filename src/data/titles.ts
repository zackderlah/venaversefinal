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
    'Scholar of Sound',
    'Memories Of Melody',
    'Audio Authority',
    'Audiophile',
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
    'The Librarian',
    'Tome Overseer',
    'Master of Literature',
    'Literary GOD',
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

// Helper function to get the title index for a category based on review count
function getTitleIndexForCategory(count: number): number {
  if (count >= 45) return 9;
  if (count >= 40) return 8;
  if (count >= 35) return 7;
  if (count >= 30) return 6;
  if (count >= 25) return 5;
  if (count >= 20) return 4;
  if (count >= 15) return 3;
  if (count >= 10) return 2;
  if (count >= 5) return 1;
  return 0;
}

// Helper function to get the generic title index based on total review count
function getGenericTitleIndex(total: number): number {
  if (total >= 100) return 10;
  if (total >= 90) return 9;
  if (total >= 80) return 8;
  if (total >= 70) return 7;
  if (total >= 60) return 6;
  if (total >= 50) return 5;
  if (total >= 40) return 4;
  if (total >= 30) return 3;
  if (total >= 20) return 2;
  if (total >= 10) return 1;
  return 0;
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