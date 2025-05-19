import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    orderBy: { date: 'desc' },
    take: 10,
    include: { user: { select: { id: true, username: true, profileImage: true } } },
  });
  return NextResponse.json(reviews, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
} 