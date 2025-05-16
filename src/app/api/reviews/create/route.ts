import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    const { title, category, creator, year: yearStr, rating: ratingStr, review } = await req.json();

    // Validate input
    if (!title || !category || !creator || !yearStr || !ratingStr || !review) {
      return NextResponse.json({ message: 'all fields are required' }, { status: 400 });
    }

    const year = parseInt(yearStr as string);
    const rating = parseInt(ratingStr as string);

    if (isNaN(year) || String(yearStr).length !== 4) {
      return NextResponse.json({ message: 'invalid year format' }, { status: 400 });
    }
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return NextResponse.json({ message: 'rating must be between 1 and 10' }, { status: 400 });
    }
    const allowedCategories = ['film', 'music', 'anime', 'books'];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ message: 'invalid category' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        title,
        category,
        creator,
        year,
        rating,
        review,
        date: new Date(),
        userId: Number(session.user.id),
      },
      include: {
        user: {
          select: { username: true }
        }
      }
    });

    return NextResponse.json(newReview, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'error creating review' }, { status: 500 });
  }
} 