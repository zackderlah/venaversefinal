import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    orderBy: { date: 'desc' },
    take: 10,
    include: { user: { select: { username: true, id: true } } },
  });
  return NextResponse.json(reviews);
} 