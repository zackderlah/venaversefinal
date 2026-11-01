import { prisma } from '@/lib/prisma';
import {
  CATEGORY_TITLES,
  getUnlockedTitlesByCategory,
  getUnlockedGenericTitles,
  Category,
} from '@/data/titles';

/** Titles a user has unlocked, derived from their review counts per category. */
export async function getUserUnlocks(userId: number) {
  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { category: true },
  });
  const counts: Partial<Record<Category, number>> = {};
  for (const r of reviews) {
    const raw = r.category;
    const cat = (raw === 'film' ? 'film-tv' : raw) as Category;
    if (!CATEGORY_TITLES[cat]) continue;
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return {
    unlockedByCategory: getUnlockedTitlesByCategory(counts),
    unlockedGeneric: getUnlockedGenericTitles(reviews.length),
  };
}
