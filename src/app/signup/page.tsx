'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'signup failed');
    }
  }

  return (
    <div className="flex justify-center py-4 md:py-10">
      <div className="vv-panel w-full max-w-md p-8 md:p-10">
        <h2 className="mb-8 text-center text-[1.75rem] font-bold lowercase tracking-[-0.03em] text-vv-fg">create account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full px-4 py-2.5 text-[15px]"
              placeholder="email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id="username"
              name="username"
              type="text"
              required
              className="block w-full px-4 py-2.5 text-[15px]"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          </div>
          {error && <div className="text-red-500 text-sm text-center lowercase">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="vv-btn vv-btn-solid w-full !py-2.5 !text-[14px] disabled:opacity-50"
          >
            {loading ? 'creating account...' : 'sign up'}
          </button>
        </form>
      </div>
    </div>
  );
} 