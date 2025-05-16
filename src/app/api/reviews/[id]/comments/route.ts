import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

export const dynamic = 'force-dynamic';

// GET: List comments for a review
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const reviewId = parseInt(params.id);
  if (isNaN(reviewId)) return NextResponse.json([], { status: 400 });
  const comments = await prisma.comment.findMany({
    where: { reviewId },
    include: { user: { select: { username: true, id: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(comments);
}

// POST: Add a comment (must be logged in)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = cookies().get('session_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let userPayload: any;
  try {
    userPayload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
  const reviewId = parseInt(params.id);
  if (isNaN(reviewId)) return NextResponse.json({ error: 'Invalid review id' }, { status: 400 });
  const { text } = await req.json();
  if (!text || typeof text !== 'string' || text.length < 1 || text.length > 1000) {
    return NextResponse.json({ error: 'Comment must be 1-1000 characters' }, { status: 400 });
  }
  const comment = await prisma.comment.create({
    data: {
      text,
      reviewId,
      userId: userPayload.id,
    },
    include: { user: { select: { username: true, id: true } } },
  });
  return NextResponse.json(comment);
}

// DELETE: Remove a comment (must be owner)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = cookies().get('session_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let userPayload: any;
  try {
    userPayload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
  const { commentId } = await req.json();
  if (!commentId) return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
  // Only allow deleting own comment
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userPayload.id) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }
  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
} 