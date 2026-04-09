import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function normalizeCategory(category: unknown): string {
  const c = String(category ?? 'film').trim();
  const normalized = c === 'album' ? 'music' : c;
  const allowed = ['film', 'music', 'anime', 'books', 'games', 'other'];
  return allowed.includes(normalized) ? normalized : 'film';
}

async function getOwnedDraft(id: number, userId: number) {
  return prisma.reviewDraft.findFirst({
    where: { id, userId },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }
    const { id: idStr } = params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 });
    }
    const draft = await getOwnedDraft(id, Number(session.user.id));
    if (!draft) {
      return NextResponse.json({ message: 'not found' }, { status: 404 });
    }
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Draft GET error:', error);
    return NextResponse.json({ message: 'server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }
    const { id: idStr } = params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 });
    }
    const userId = Number(session.user.id);
    const existing = await getOwnedDraft(id, userId);
    if (!existing) {
      return NextResponse.json({ message: 'not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data: {
      title?: string;
      category?: string;
      creator?: string;
      year?: string;
      rating?: string;
      review?: string;
      imageUrl?: string | null;
    } = {};
    if ('title' in body) data.title = String(body.title ?? '').slice(0, 500);
    if ('category' in body) data.category = normalizeCategory(body.category);
    if ('creator' in body) data.creator = String(body.creator ?? '').slice(0, 500);
    if ('year' in body) data.year = String(body.year ?? '').slice(0, 32);
    if ('rating' in body) data.rating = String(body.rating ?? '').slice(0, 32);
    if ('review' in body) data.review = String(body.review ?? '');
    if ('imageUrl' in body) {
      const u = body.imageUrl;
      data.imageUrl = u ? String(u).slice(0, 2000) : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(existing);
    }

    const draft = await prisma.reviewDraft.update({
      where: { id },
      data,
    });
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Draft PATCH error:', error);
    return NextResponse.json({ message: 'server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }
    const { id: idStr } = params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 });
    }
    const userId = Number(session.user.id);
    const result = await prisma.reviewDraft.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      return NextResponse.json({ message: 'not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Draft DELETE error:', error);
    return NextResponse.json({ message: 'server error' }, { status: 500 });
  }
}
