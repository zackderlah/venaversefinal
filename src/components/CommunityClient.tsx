"use client";
import UserBanner from './UserBanner';
import { useState } from 'react';
import PageHeader from './PageHeader';

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
    <div>
      <PageHeader
        title="community"
        subtitle="the people behind the reviews."
        description={`${users.length} members, sorted by level.`}
      />
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="search by username..."
          className="w-full !rounded-full px-4 py-2 text-sm lowercase md:max-w-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="vv-btn self-start md:self-auto"
        >
          level: {sortOrder === 'desc' ? 'highest first' : 'lowest first'}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {filtered.length ? (
          filtered.map(user => <UserBanner key={user.id} user={user} />)
        ) : (
          <div className="vv-panel px-6 py-12 text-center text-vv-faint lowercase md:col-span-2">no users found</div>
        )}
      </div>
    </div>
  );
} 