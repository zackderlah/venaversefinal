import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  // Optional cap for lightweight callers such as the navbar's live results.
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 50, 1), 50);

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ reviews: [] });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { creator: { contains: query, mode: 'insensitive' } },
          { review: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { date: 'desc' },
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
      take: limit,
    });

    const reviewsWithCommentCount = reviews.map(r => ({
      ...r,
      commentCount: r._count.comments,
    }));

    return NextResponse.json({
      reviews: reviewsWithCommentCount,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search reviews' },
      { status: 500 }
    );
  }
}

