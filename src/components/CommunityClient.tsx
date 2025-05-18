"use client";
import UserBanner from './UserBanner';
import { useState } from 'react';

type UserWithLevel = {
  id: number;
  username: string;
  profileImage?: string | null;
  createdAt?: string | Date;
  reviews: any[];
  bio?: string;
  level: number;
};

function compareUsers(a: UserWithLevel, b: UserWithLevel, sortOrder: 'desc' | 'asc') {
  // Primary: level
  if (a.level !== b.level) {
    return sortOrder === 'desc' ? b.level - a.level : a.level - b.level;
  }
  // If both are level 0, sort by profile image, then alphabetically
  if (a.level === 0 && b.level === 0) {
    if (a.profileImage && !b.profileImage) return -1;
    if (!a.profileImage && b.profileImage) return 1;
  }
  // Secondary: alphabetical by username
  return a.username.localeCompare(b.username);
}

export default function CommunityClient({ users }: { users: UserWithLevel[] }) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filtered = users
    .filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => compareUsers(a, b, sortOrder));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black mb-6 tracking-tight lowercase">community</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="search by username..."
          className="border border-black dark:border-white rounded px-3 py-2 text-sm lowercase flex-1 bg-white dark:bg-[#0A0A0A] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold lowercase">sort by level</label>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="border border-black dark:border-white rounded px-3 py-1 text-xs lowercase bg-white dark:bg-[#0A0A0A] text-black dark:text-white font-bold hover:bg-gray-100 hover:dark:bg-gray-800 transition-all"
          >
            {sortOrder === 'desc' ? 'highest first' : 'lowest first'}
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {filtered.length ? (
          filtered.map(user => <UserBanner key={user.id} user={user} />)
        ) : (
          <div className="text-gray-400 lowercase text-center">no users found</div>
        )}
      </div>
    </div>
  );
} 