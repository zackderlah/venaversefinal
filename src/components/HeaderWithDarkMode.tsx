'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Clock from './Clock';

export default function HeaderWithDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="mb-6">
      <div className="mb-4">
        <div className="flex flex-row justify-between items-center w-full sm:hidden">
          <h1 className="text-4xl font-black tracking-tight lowercase">vena/verse</h1>
          <button
            onClick={toggleDark}
            className="px-3 py-1 border border-black bg-gray-100 dark:bg-gray-800 dark:text-yellow-300 dark:border-gray-400 transition-colors duration-150 hover:bg-gray-200 hover:dark:bg-gray-700 ml-2"
            aria-label="toggle dark mode"
            type="button"
          >
            {isDark ? '🌙' : '☀️'}
          </button>
        </div>
        <div className="sm:flex justify-between items-center hidden">
          <h1 className="text-4xl font-black tracking-tight lowercase">vena/verse</h1>
          <div className="flex items-center gap-4">
            <Clock />
            <button
              onClick={toggleDark}
              className="px-3 py-1 border border-black bg-gray-100 dark:bg-gray-800 dark:text-yellow-300 dark:border-gray-400 transition-colors duration-150 hover:bg-gray-200 hover:dark:bg-gray-700"
              aria-label="toggle dark mode"
              type="button"
            >
              {isDark ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
        <div className="sm:hidden mt-2">
          <Clock />
        </div>
      </div>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden w-10 h-10 flex items-center justify-center border border-black dark:border-white mb-4"
        aria-label="toggle menu"
      >
        <span className={`block w-5 relative ${isMenuOpen ? 'h-0' : 'h-0.5 bg-current'}`}>
          <span className={`block absolute w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-0' : '-translate-y-1.5'}`}></span>
          <span className={`block absolute w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-0' : 'translate-y-1.5'}`}></span>
        </span>
      </button>
      {/* Navigation Links */}
      <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-6 text-sm items-start md:items-center lowercase`}>
        <Link href="/" className="nav-link text-gray-900 w-full md:w-auto">home</Link>
        <Link href="/films" className="nav-link text-blue-600 w-full md:w-auto">films</Link>
        <Link href="/music" className="nav-link text-purple-600 w-full md:w-auto">music</Link>
        <Link href="/anime" className="nav-link text-red-600 w-full md:w-auto">anime</Link>
        <Link href="/manga" className="nav-link text-green-600 w-full md:w-auto">manga</Link>
      </nav>
    </header>
  );
} 