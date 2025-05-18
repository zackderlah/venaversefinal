import { prisma } from '@/lib/prisma';
import { calculateUserXPAndLevel } from '@/utils/level';
import { Suspense } from 'react';
import CommunityClient from '@/components/CommunityClient';

async function getUsers() {
  const users = await prisma.user.findMany({
    include: { reviews: true },
  });
  // Attach level to each user for sorting
  return users.map((user: any) => ({
    ...user,
    level: calculateUserXPAndLevel(user.reviews || []).level,
  }));
}

export default async function CommunityPage() {
  const users = await getUsers();
  return (
    <Suspense fallback={<div className="text-center text-gray-400">loading users...</div>}>
      <CommunityClient users={users} />
    </Suspense>
  );
} 