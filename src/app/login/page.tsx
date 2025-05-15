'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FormLoadingBar from '@/components/FormLoadingBar';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      await refreshUser();
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 border-2 border-black dark:border-white p-8 bg-white dark:bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-black mb-6 lowercase">log in</h2>
      <FormLoadingBar loading={loading} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-bold lowercase">username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border-2 border-black dark:border-white bg-transparent px-3 py-2 text-sm lowercase focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-900 transition"
            required
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-bold lowercase">password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border-2 border-black dark:border-white bg-transparent px-3 py-2 text-sm lowercase focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-900 transition"
            required
          />
        </div>
        {error && <div className="text-red-600 text-xs lowercase">{error}</div>}
        <button
          type="submit"
          className="w-full border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold py-2 text-sm lowercase transition-colors hover:bg-gray-900 hover:dark:bg-gray-200"
          disabled={loading}
        >
          log in
        </button>
      </form>
      <div className="mt-4 text-xs text-gray-500 lowercase">
        don&apos;t have an account? <a href="/signup" className="underline">sign up</a>
      </div>
    </div>
  );
} 