import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FILM_TV_CATEGORY, normalizeReviewCategoryInput } from '@/lib/reviewCategories';

export const dynamic = 'force-dynamic';

function normalizeCategory(category: unknown): string {
  const n = normalizeReviewCategoryInput(
    typeof category === 'string' ? category : String(category ?? FILM_TV_CATEGORY)
  );
  return n ?? FILM_TV_CATEGORY;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }
    const userId = Number(session.user.id);
    const drafts = await prisma.reviewDraft.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        creator: true,
        year: true,
        rating: true,
        imageUrl: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Drafts GET error:', error);
    return NextResponse.json({ message: 'server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const {
      title = '',
      category,
      creator = '',
      year = '',
      rating = '',
      review = '',
      imageUrl = null,
    } = body;

    const draft = await prisma.reviewDraft.create({
      data: {
        userId: Number(session.user.id),
        title: String(title).slice(0, 500),
        category: normalizeCategory(category),
        creator: String(creator).slice(0, 500),
        year: String(year).slice(0, 32),
        rating: String(rating).slice(0, 32),
        review: String(review),
        imageUrl: imageUrl ? String(imageUrl).slice(0, 2000) : null,
      },
    });
    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error('Drafts POST error:', error);
    return NextResponse.json({ message: 'server error' }, { status: 500 });
  }
}
