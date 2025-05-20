import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  CATEGORY_TITLES,
  GENERIC_TITLES,
  getUnlockedTitlesByCategory,
  getUnlockedGenericTitles,
  Category
} from '@/data/titles';

// Helper to count reviews by category for a user
async function getUserReviewCounts(userId: number) {
  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { category: true },
  });
  const counts: Partial<Record<Category, number>> = {};
  for (const r of reviews) {
    const cat = r.category as Category;
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return { counts, total: reviews.length };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { counts, total } = await getUserReviewCounts(userId);
  const unlockedByCategory = getUnlockedTitlesByCategory(counts);
  const unlockedGeneric = getUnlockedGenericTitles(total);

  return NextResponse.json({
    unlockedByCategory,
    unlockedGeneric,
    selectedTitle: user.selectedTitle,
    selectedTitleCategory: user.selectedTitleCategory,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { counts, total } = await getUserReviewCounts(userId);
  const unlockedByCategory = getUnlockedTitlesByCategory(counts);
  const unlockedGeneric = getUnlockedGenericTitles(total);

  const { title, category } = await req.json();
  let valid = false;
  if (category && CATEGORY_TITLES[category as Category]) {
    valid = unlockedByCategory[category as Category].includes(title);
  } else if (category === 'generic') {
    valid = unlockedGeneric.includes(title);
  }
  if (!valid) {
    return NextResponse.json({ error: 'Title not unlocked or invalid' }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      selectedTitle: title,
      selectedTitleCategory: category,
    },
  });
  return NextResponse.json({ success: true });
} 