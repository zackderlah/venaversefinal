import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    orderBy: { date: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      category: true,
      creator: true,
      year: true,
      rating: true,
      review: true,
      date: true,
      imageUrl: true,
      userId: true,
      user: { select: { id: true, username: true, profileImage: true } },
      _count: { select: { comments: true } },
    },
  });
  const reviewsWithCommentCount = reviews.map(r => ({ ...r, commentCount: r._count.comments }));
  return NextResponse.json(reviewsWithCommentCount, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
} 