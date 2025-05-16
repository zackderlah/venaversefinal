'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('invalid credentials');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('an error occurred during login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md border-2 border-black dark:border-white bg-white dark:bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg p-8">
        <h2 className="text-center text-2xl font-black mb-6 lowercase text-black dark:text-white tracking-tight">sign in</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              className="block w-full rounded-md border-2 border-black dark:border-white px-3 py-2 bg-white dark:bg-[#18181b] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-base"
              placeholder="email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded-md border-2 border-black dark:border-white px-3 py-2 bg-white dark:bg-[#18181b] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-base"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center lowercase font-mono">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border-2 border-black dark:border-white rounded-md bg-black dark:bg-white text-white dark:text-black font-bold lowercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-150 font-mono text-base"
          >
            {loading ? 'signing in...' : 'sign in'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/signup" className="inline-block text-xs font-mono lowercase text-black dark:text-white border-b-2 border-black dark:border-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors">don't have an account? sign up</a>
        </div>
      </div>
    </div>
  );
} 