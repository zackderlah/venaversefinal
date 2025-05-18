import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get('profileId'));
  const page = Number(searchParams.get('page') || '1');
  const take = 5;
  const skip = (page - 1) * take;
  if (!profileId) {
    return NextResponse.json({ comments: [], total: 0 });
  }
  const [comments, total] = await Promise.all([
    prisma.profileComment.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { user: { select: { id: true, username: true, profileImage: true } } },
    }),
    prisma.profileComment.count({ where: { profileId } }),
  ]);
  return NextResponse.json({ comments, total });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('ProfileComment POST session:', session);
    if (!session?.user?.id) {
      console.error('No user id in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    console.log('ProfileComment POST body:', body);
    const { text, profileId } = body;
    if (!text || !profileId) {
      console.error('Missing text or profileId');
      return NextResponse.json({ error: 'Missing text or profileId' }, { status: 400 });
    }
    const comment = await prisma.profileComment.create({
      data: {
        text,
        userId: Number(session.user.id),
        profileId: Number(profileId),
      },
      include: { user: { select: { id: true, username: true, profileImage: true } } },
    });
    console.log('ProfileComment created:', comment);
    return NextResponse.json({ comment });
  } catch (error) {
    console.error('ProfileComment POST error:', error);
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { commentId } = await req.json();
    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
    }
    // Fetch the comment to check permissions
    const comment = await prisma.profileComment.findUnique({
      where: { id: Number(commentId) },
      include: { profile: true, user: true },
    });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    const userId = Number(session.user.id);
    if (comment.userId !== userId && comment.profileId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await prisma.profileComment.delete({ where: { id: Number(commentId) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ProfileComment DELETE error:', error);
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
} 