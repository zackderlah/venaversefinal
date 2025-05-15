'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const user = await res.json();
          router.replace(`/profile/${user.username}`);
        } else {
          router.replace('/login');
        }
      });
  }, [router]);
  return <div className="text-center mt-20 text-gray-500 lowercase">loading...</div>;
} 