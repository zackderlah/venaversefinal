import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    where: { category: 'film' },
    orderBy: { date: 'desc' },
    include: {
      user: { select: { username: true, id: true, profileImage: true } },
      _count: { select: { comments: true } },
    },
  });
  const reviewsWithCommentCount = reviews.map(r => ({ ...r, commentCount: r._count.comments }));
  return NextResponse.json(reviewsWithCommentCount);
} 