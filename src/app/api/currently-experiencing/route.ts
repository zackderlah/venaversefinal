import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/([\wÀ-ÿ][^\s-]*)/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const items = await prisma.currentlyExperiencing.findMany({
      where: { userId: Number(userId) },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('CurrentlyExperiencing GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, type, creator, progress, imageUrl, year, seasons } = await req.json();
    if (!title || !type || !creator) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const item = await prisma.currentlyExperiencing.create({
      data: {
        title: toTitleCase(title),
        type,
        creator: toTitleCase(creator),
        progress: progress || '',
        imageUrl: imageUrl || null,
        year: year || '',
        seasons: seasons || '',
        userId: Number(session.user.id),
      },
    });
    return NextResponse.json({ item });
  } catch (error) {
    console.error('CurrentlyExperiencing POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const item = await prisma.currentlyExperiencing.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.currentlyExperiencing.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CurrentlyExperiencing DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 