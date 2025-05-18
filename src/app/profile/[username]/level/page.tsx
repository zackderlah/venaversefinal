import { prisma } from '@/lib/prisma';
import { calculateUserXPAndLevel } from '@/utils/level';
import LevelBadge from '@/components/LevelBadge';
import { notFound } from 'next/navigation';

const BADGE_LEVELS = [0, 5, 10, 15, 20, 25, 30, 40, 50];

export default async function ProfileLevelPage({ params }: { params: { username: string } }) {
  const { username } = params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: { reviews: true },
  });
  if (!user) return notFound();

  const { xp, level } = calculateUserXPAndLevel(user.reviews);
  const xpThisLevel = xp % 100;
  const xpToNext = 100 - xpThisLevel;

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-4 lowercase">{user.username}'s level</h1>
      <div className="flex items-center gap-4 mb-6">
        <LevelBadge level={level} />
        <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{xp} XP</span>
      </div>
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span>Level {level}</span>
          <span>{xpThisLevel}/100 XP</span>
          <span>Level {level + 1}</span>
        </div>
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border-2 border-black dark:border-white">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-500"
            style={{ width: `${xpThisLevel}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">{xpToNext} XP to next level</div>
      </div>
      <h2 className="text-xl font-black mb-2 lowercase">all level badges</h2>
      <div className="flex flex-wrap gap-4 items-center">
        {BADGE_LEVELS.map(lvl => (
          <div key={lvl} className="flex flex-col items-center gap-1">
            <LevelBadge level={lvl} />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">Lv. {lvl}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 text-xs text-gray-500">
        <p>Reviews &lt; 50 words: <span className="font-bold">50 XP</span> | Reviews ≥ 50 words: <span className="font-bold">100 XP</span></p>
        <p>Every 100 XP = 1 level. Level badge color changes at certain breakpoints.</p>
      </div>
    </div>
  );
} 