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
    <div className="flex justify-center py-4 md:py-10">
      <div className="vv-panel w-full max-w-md p-8 md:p-10">
        <h2 className="mb-8 text-center text-[1.75rem] font-bold lowercase tracking-[-0.03em] text-vv-fg">
          reset password
        </h2>
        {!token ? (
          <div className="space-y-4 text-center">
            <p className="text-red-500 text-sm lowercase">invalid or missing reset token</p>
            <Link
              href="/forgot-password"
              className="inline-block text-[13px] lowercase text-vv-muted underline underline-offset-4 transition-colors hover:text-vv-fg"
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
                className="block w-full px-4 py-2.5 text-[15px]"
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
                className="block w-full px-4 py-2.5 text-[15px]"
                placeholder="confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center lowercase">{error}</div>}
            {message && (
              <div className="text-green-600 dark:text-green-400 text-sm text-center lowercase">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="vv-btn vv-btn-solid w-full !py-2.5 !text-[14px] disabled:opacity-50"
            >
              {loading ? 'updating...' : 'update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
