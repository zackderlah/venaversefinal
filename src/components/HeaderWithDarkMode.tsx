'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Clock from './Clock';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function HeaderWithDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await signOut();
    router.push('/login');
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
        <div className="flex flex-col md:flex-row md:items-center w-full">
          <Link href="/" className={`nav-link text-gray-900 w-full md:w-auto${pathname === '/' ? ' active' : ''}`}>home</Link>
          <Link href="/films" className={`nav-link text-blue-600 w-full md:w-auto${pathname.startsWith('/films') ? ' active' : ''}`}>films</Link>
          <Link href="/music" className={`nav-link text-purple-600 w-full md:w-auto${pathname.startsWith('/music') ? ' active' : ''}`}>music</Link>
          <Link href="/anime" className={`nav-link text-red-600 w-full md:w-auto${pathname.startsWith('/anime') ? ' active' : ''}`}>anime</Link>
          <Link href="/books" className={`nav-link text-green-600 w-full md:w-auto${pathname.startsWith('/books') ? ' active' : ''}`}>books</Link>
          <Link href="/other" className={`nav-link text-yellow-600 w-full md:w-auto${pathname.startsWith('/other') ? ' active' : ''}`}>other</Link>
          <div className="flex gap-2 mt-4 md:mt-0 ml-auto">
            {user ? (
              <>
                <Link href="/create-post" className="border-2 border-black dark:border-white px-3 py-1 font-bold bg-white dark:bg-[#0A0A0A] text-black dark:text-white hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors text-xs lowercase">create post</Link>
                <Link href="/profile" className="border-2 border-black dark:border-white px-3 py-1 font-bold bg-white dark:bg-[#0A0A0A] text-black dark:text-white hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors text-xs lowercase">profile</Link>
                <button onClick={handleLogout} className="border-2 border-black dark:border-white px-3 py-1 font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 hover:dark:bg-gray-200 transition-colors text-xs lowercase">logout</button>
              </>
            ) : (
              <Link href="/login" className="border-2 border-black dark:border-white px-3 py-1 font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 hover:dark:bg-gray-200 transition-colors text-xs lowercase">login</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 