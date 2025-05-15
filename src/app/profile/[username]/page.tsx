'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface UserProfile {
  id: number;
  username: string;
  profilePic?: string;
  background?: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/user/${username}`)
      .then(async (res) => {
        if (res.ok) {
          setUser(await res.json());
        } else {
          setError('User not found');
        }
      })
      .catch(() => setError('Could not load profile'));
    fetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const me = await res.json();
          setCurrentUser(me.username);
        }
      });
  }, [username]);

  if (error) {
    return <div className="text-center mt-20 text-red-600 lowercase">{error}</div>;
  }
  if (!user) {
    return <div className="text-center mt-20 text-gray-500 lowercase">loading...</div>;
  }

  const isOwner = currentUser === user.username;

  return (
    <div className="w-full min-h-screen mt-0 border-2 border-black dark:border-white bg-white dark:bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Banner / Background */}
      <div className="relative h-40 border-b-2 border-black dark:border-white bg-gray-100 dark:bg-gray-900 flex items-end">
        {user.background ? (
          <img src={user.background} alt="profile background" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-xs text-gray-400">profile background (coming soon)</div>
        )}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        <div className="relative z-10 flex items-end h-full pl-8 pb-[-32px]">
          <div className="w-28 h-28 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-5xl font-black text-gray-400 -mb-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {user.profilePic ? (
              <img src={user.profilePic} alt="profile pic" className="w-full h-full object-cover" />
            ) : (
              user.username[0]
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 pt-20 pb-8 px-4 md:px-16">
        <div className="flex flex-col items-center md:items-start min-w-[180px]">
          <div className="text-2xl font-black mb-2 lowercase">@{user.username}</div>
          <div className="text-xs text-gray-500 lowercase mb-4">joined {new Date(user.createdAt).toLocaleDateString()}</div>
          {isOwner ? (
            <>
              <button className="text-xs underline text-gray-500 lowercase cursor-not-allowed mb-2" disabled>
                change profile picture (coming soon)
              </button>
              <button className="text-xs underline text-gray-500 lowercase cursor-not-allowed" disabled>
                change background (coming soon)
              </button>
            </>
          ) : null}
        </div>
        <div className="flex-1">
          <div className="border-2 border-black dark:border-white p-6 bg-white dark:bg-[#0A0A0A] text-gray-500 text-center text-xs lowercase">
            user reviews and posts will appear here (coming soon)
          </div>
        </div>
      </div>
    </div>
  );
} 