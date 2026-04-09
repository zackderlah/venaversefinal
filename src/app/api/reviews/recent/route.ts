import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const REVIEWS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const skip = (page - 1) * REVIEWS_PER_PAGE;

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
    orderBy: { date: 'desc' },
      skip,
      take: REVIEWS_PER_PAGE,
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
    }),
    prisma.review.count(),
  ]);

  const reviewsWithCommentCount = reviews.map(r => ({ ...r, commentCount: r._count.comments }));
  const totalPages = Math.ceil(totalCount / REVIEWS_PER_PAGE);

  return NextResponse.json({
    reviews: reviewsWithCommentCount,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
} 