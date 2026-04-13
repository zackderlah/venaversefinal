import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FILM_TV_CATEGORY } from '@/lib/reviewCategories';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    where: { category: { in: [FILM_TV_CATEGORY, 'film'] } },
    orderBy: { date: 'desc' },
    include: {
      user: { select: { username: true, id: true, profileImage: true } },
      _count: { select: { comments: true } },
    },
  });
  const reviewsWithCommentCount = reviews.map(r => ({ ...r, commentCount: r._count.comments }));
  return NextResponse.json(reviewsWithCommentCount);
} 