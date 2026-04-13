import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isRatingProvided, parseFiveStarRating } from '@/lib/starRating';
import { normalizeReviewCategoryInput } from '@/lib/reviewCategories';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    const reviewId = parseInt(params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json({ message: 'invalid review id' }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ message: 'review not found' }, { status: 404 });
    }

    if (existingReview.userId !== Number(session.user.id) && !session.user.isAdmin) {
      return NextResponse.json({ message: 'you are not authorized to edit this review' }, { status: 403 });
    }

    const { title, category, creator, year: yearStr, rating: ratingStr, review } = await req.json();

    // Validate input
    if (!title || !category || !creator || !yearStr || !isRatingProvided(ratingStr)) {
      return NextResponse.json({ message: 'all fields except review are required' }, { status: 400 });
    }

    const year = parseInt(yearStr as string);
    const parsedRating = parseFiveStarRating(ratingStr);

    if (isNaN(year) || String(yearStr).length !== 4) {
      return NextResponse.json({ message: 'invalid year format' }, { status: 400 });
    }
    if (!parsedRating.ok) {
      return NextResponse.json({ message: parsedRating.message }, { status: 400 });
    }
    const rating = parsedRating.value;
    const normalizedCategory = normalizeReviewCategoryInput(category);
    if (!normalizedCategory) {
      return NextResponse.json({ message: 'invalid category' }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        title,
        category: normalizedCategory,
        creator,
        year,
        rating,
        review,
      },
      include: {
        user: {
          select: { username: true, profileImage: true }
        }
      }
    });

    return NextResponse.json(updatedReview, { status: 200 });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ message: 'error updating review' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reviewId = parseInt(params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json({ message: 'invalid review id' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
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
        user: { select: { username: true, profileImage: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ message: 'review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ message: 'error fetching review' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    const reviewId = parseInt(params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json({ message: 'invalid review id' }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ message: 'review not found' }, { status: 404 });
    }

    if (existingReview.userId !== Number(session.user.id) && !session.user.isAdmin) {
      return NextResponse.json({ message: 'you are not authorized to delete this review' }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: 'review deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ message: 'error deleting review' }, { status: 500 });
  }
} 