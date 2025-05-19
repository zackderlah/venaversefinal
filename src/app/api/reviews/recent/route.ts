import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    orderBy: { date: 'desc' },
    take: 10,
    include: { user: { select: { username: true, id: true, profileImage: true } } },
  });
  return NextResponse.json(reviews, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
} 