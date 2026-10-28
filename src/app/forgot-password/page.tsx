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
    <div className="flex justify-center py-4 md:py-10">
      <div className="vv-panel w-full max-w-md p-8 md:p-10">
        <h2 className="mb-8 text-center text-[1.75rem] font-bold lowercase tracking-[-0.03em] text-vv-fg">
          recover password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            className="block w-full px-4 py-2.5 text-[15px]"
            placeholder="account email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {error && <div className="text-red-500 text-sm text-center lowercase">{error}</div>}
          {message && (
            <div className="text-green-600 dark:text-green-400 text-sm text-center lowercase">
              {message}
            </div>
          )}
          {debugResetUrl && (
            <div className="text-xs text-center lowercase">
              <a href={debugResetUrl} className="underline break-all">
                debug reset link
              </a>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="vv-btn vv-btn-solid w-full !py-2.5 !text-[14px] disabled:opacity-50"
          >
            {loading ? 'sending...' : 'send reset link'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-block text-[13px] lowercase text-vv-muted underline underline-offset-4 transition-colors hover:text-vv-fg"
          >
            back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
