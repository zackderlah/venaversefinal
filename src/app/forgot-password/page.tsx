'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugResetUrl, setDebugResetUrl] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setDebugResetUrl('');

    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'unable to start password reset');
      } else {
        setMessage(
          data.message ||
            'if an account exists for that email, a password reset link has been generated.'
        );
        if (data.resetUrl) setDebugResetUrl(String(data.resetUrl));
      }
    } catch {
      setError('unable to start password reset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-6 md:py-8">
      <div className="w-full max-w-md review-card content-card rounded-lg p-8">
        <h2 className="text-center text-2xl font-black mb-6 lowercase text-black dark:text-white tracking-tight">
          recover password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            className="block w-full rounded-md border-2 border-black dark:border-white px-3 py-2 bg-white dark:bg-[#18181b] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-base"
            placeholder="account email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {error && <div className="text-red-500 text-sm text-center lowercase font-mono">{error}</div>}
          {message && (
            <div className="text-green-600 dark:text-green-400 text-sm text-center lowercase font-mono">
              {message}
            </div>
          )}
          {debugResetUrl && (
            <div className="text-xs text-center lowercase font-mono">
              <a href={debugResetUrl} className="underline break-all">
                debug reset link
              </a>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border-2 border-black dark:border-white rounded-md bg-black dark:bg-white text-white dark:text-black font-bold lowercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-150 font-mono text-base"
          >
            {loading ? 'sending...' : 'send reset link'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-block text-xs font-mono lowercase text-black dark:text-white border-b-2 border-black dark:border-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
