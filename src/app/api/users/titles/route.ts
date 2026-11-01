import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CATEGORY_TITLES, Category } from '@/data/titles';
import { getUserUnlocks } from '@/lib/userUnlocks';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { unlockedByCategory, unlockedGeneric } = await getUserUnlocks(userId);

  return NextResponse.json({
    unlockedByCategory,
    unlockedGeneric,
    selectedTitle: user.selectedTitle,
    selectedTitleCategory: user.selectedTitleCategory,
    selectedBanner: user.selectedBanner,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { unlockedByCategory, unlockedGeneric } = await getUserUnlocks(userId);

  const { title, category } = await req.json();
  let valid = false;
  if (category && CATEGORY_TITLES[category as Category]) {
    valid = unlockedByCategory[category as Category].includes(title);
  } else if (category === 'generic') {
    valid = unlockedGeneric.includes(title);
  }
  if (!valid) {
    return NextResponse.json({ error: 'Title not unlocked or invalid' }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      selectedTitle: title,
      selectedTitleCategory: category,
    },
  });
  return NextResponse.json({ success: true });
} 