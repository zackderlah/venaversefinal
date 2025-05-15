import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    where: { category: 'other' }, // Changed category to 'other'
    orderBy: { date: 'desc' },
    include: { user: { select: { username: true, id: true } } },
  });
  return NextResponse.json(reviews);
} 