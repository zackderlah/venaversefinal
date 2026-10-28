'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

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
    <div className="flex justify-center py-4 md:py-10">
      <div className="vv-panel w-full max-w-md p-8 md:p-10">
        <h2 className="mb-8 text-center text-[1.75rem] font-bold lowercase tracking-[-0.03em] text-vv-fg">sign in</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              className="block w-full px-4 py-2.5 text-[15px]"
              placeholder="email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full px-4 py-2.5 text-[15px]"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-[13px] lowercase text-vv-muted underline underline-offset-4 transition-colors hover:text-vv-fg"
              >
                forgot password?
              </Link>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center lowercase">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="vv-btn vv-btn-solid w-full !py-2.5 !text-[14px] disabled:opacity-50"
          >
            {loading ? 'signing in...' : 'sign in'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/signup" className="inline-block text-[13px] lowercase text-vv-muted underline underline-offset-4 transition-colors hover:text-vv-fg">don't have an account? sign up</Link>
        </div>
      </div>
    </div>
  );
} 