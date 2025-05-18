import Link from 'next/link';
import LevelBadge from './LevelBadge';
import { calculateUserXPAndLevel } from '@/utils/level';

export default function UserBanner({ user }: { user: any }) {
  const { level } = calculateUserXPAndLevel(user.reviews || []);
  return (
    <Link href={`/profile/${user.username}`} className="block">
      <div className="review-card flex flex-row items-center gap-6 p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-black dark:border-white bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-4xl text-gray-400">👤</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-black tracking-tight lowercase truncate">{user.username}</span>
            <span className="ml-auto"><LevelBadge level={level} /></span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-300 text-xs mb-1 lowercase">
            <span>member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</span>
            <span>•</span>
            <span>{user?.reviews.length || 0} reviews</span>
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm lowercase truncate">
            {user?.bio || "no bio yet."}
          </div>
        </div>
      </div>
    </Link>
  );
} 