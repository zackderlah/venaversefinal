import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    where: { category: 'anime' },
    orderBy: { date: 'desc' },
    include: { user: { select: { username: true, id: true } } },
  });
  return NextResponse.json(reviews);
} 