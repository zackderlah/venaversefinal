import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  if (!username) {
    return NextResponse.json([], { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) {
    return NextResponse.json([], { status: 404 });
  }
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    include: {
      user: { select: { id: true, username: true, profileImage: true } },
      _count: { select: { comments: true } },
    },
  });
  const reviewsWithCommentCount = reviews.map(r => ({ ...r, commentCount: r._count.comments }));
  return NextResponse.json(reviewsWithCommentCount);
} 