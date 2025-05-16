import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

interface UserPayload {
  id: number;
  username: string;
}

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    let userPayload: UserPayload;
    try {
      userPayload = jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
      return NextResponse.json({ message: 'invalid token' }, { status: 403 });
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

    if (existingReview.userId !== userPayload.id) {
      return NextResponse.json({ message: 'you are not authorized to edit this review' }, { status: 403 });
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

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        title,
        category,
        creator,
        year,
        rating,
        review,
        // date will remain the original creation date, not updated.
      },
      include: {
        user: {
          select: { username: true }
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
      include: {
        user: { select: { username: true } }
      }
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
    const token = cookies().get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    let userPayload: UserPayload;
    try {
      userPayload = jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
      return NextResponse.json({ message: 'invalid token' }, { status: 403 });
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

    if (existingReview.userId !== userPayload.id) {
      // Even if an admin system is added later, for now, only authors can delete their own reviews.
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