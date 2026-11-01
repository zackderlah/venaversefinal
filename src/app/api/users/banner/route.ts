import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBanner, getUnlockedBannerIds } from '@/data/banners';
import { getUserUnlocks } from '@/lib/userUnlocks';

/** Set (or clear, with bannerId: null) the signed-in user's profile banner. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const { bannerId } = await req.json();

  if (bannerId !== null) {
    if (typeof bannerId !== 'string' || !getBanner(bannerId)) {
      return NextResponse.json({ error: 'Unknown banner' }, { status: 400 });
    }
    const { unlockedByCategory } = await getUserUnlocks(userId);
    if (!getUnlockedBannerIds(unlockedByCategory).has(bannerId)) {
      return NextResponse.json({ error: 'Banner not unlocked' }, { status: 403 });
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { selectedBanner: bannerId },
  });
  return NextResponse.json({ success: true });
}
