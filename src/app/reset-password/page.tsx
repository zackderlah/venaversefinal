'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params?.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!token) {
      setError('invalid reset link');
      return;
    }
    if (password.length < 6) {
      setError('password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'unable to reset password');
      } else {
        setMessage('password reset successful. redirecting to sign in...');
        setTimeout(() => router.push('/login'), 1200);
      }
    } catch {
      setError('unable to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-6 md:py-8">
      <div className="w-full max-w-md review-card content-card rounded-lg p-8">
        <h2 className="text-center text-2xl font-black mb-6 lowercase text-black dark:text-white tracking-tight">
          reset password
        </h2>
        {!token ? (
          <div className="space-y-4 text-center">
            <p className="text-red-500 text-sm lowercase font-mono">invalid or missing reset token</p>
            <Link
              href="/forgot-password"
              className="inline-block text-xs font-mono lowercase text-black dark:text-white border-b-2 border-black dark:border-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="block w-full rounded-md border-2 border-black dark:border-white px-3 py-2 bg-white dark:bg-[#18181b] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-base"
                placeholder="new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="block w-full rounded-md border-2 border-black dark:border-white px-3 py-2 bg-white dark:bg-[#18181b] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-base"
                placeholder="confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center lowercase font-mono">{error}</div>}
            {message && (
              <div className="text-green-600 dark:text-green-400 text-sm text-center lowercase font-mono">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border-2 border-black dark:border-white rounded-md bg-black dark:bg-white text-white dark:text-black font-bold lowercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-150 font-mono text-base"
            >
              {loading ? 'updating...' : 'update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
