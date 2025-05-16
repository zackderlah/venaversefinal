import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret'; // Use an environment variable

interface UserPayload {
  id: number;
  username: string;
  // add other user properties if needed
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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
        userId: userPayload.id,
      },
      include: { // Optionally include user data if needed for response, though not strictly necessary here
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