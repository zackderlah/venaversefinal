'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Clock from './Clock';

export default function HeaderWithDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // If theme is saved in localStorage, use that
    // Otherwise, check system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleDark = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-black tracking-tight lowercase">vena/verse</h1>
        <Clock />
      </div>
      <nav className="flex gap-6 text-sm items-center lowercase">
        <Link href="/" className="nav-link text-gray-900">home</Link>
        <Link href="/films" className="nav-link text-blue-600">films</Link>
        <Link href="/albums" className="nav-link text-purple-600">albums</Link>
        <Link href="/anime" className="nav-link text-red-600">anime</Link>
        <Link href="/manga" className="nav-link text-green-600">manga</Link>
        <div className="ml-auto">
          <button
            onClick={toggleDark}
            className="px-3 py-1 border border-black bg-gray-100 dark:bg-gray-800 dark:text-yellow-300 dark:border-gray-400 transition-colors duration-150 hover:bg-gray-200 hover:dark:bg-gray-700"
            aria-label="toggle dark mode"
            type="button"
          >
            {isDark ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>
    </header>
  );
} 