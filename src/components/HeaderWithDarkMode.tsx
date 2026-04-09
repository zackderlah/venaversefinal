'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Clock from './Clock';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import SearchBar from './SearchBar';
import BottomSheet from './BottomSheet';

export default function HeaderWithDarkMode() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      // Default to dark mode if no preference is saved
      document.documentElement.classList.add('dark');
      setIsDark(true);
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
    // redirect: false + refresh so SessionProvider and RSC layout see cleared cookies (avoids stale "logged in" header)
    await signOut({ redirect: false });
    router.refresh();
    router.push('/login');
  };

  return (
    <>
      <header className={`mb-6 min-w-0 max-w-full overflow-x-clip md:static sticky top-0 z-30 bg-transparent dark:bg-transparent transition-shadow ${isScrolled ? 'shadow-md' : ''} safe-area-top md:px-6`}>
        <div className="mb-4">
          <div className="flex flex-row justify-between items-center w-full sm:hidden gap-2">
            <h1 className="text-4xl font-black tracking-tight lowercase flex-1">vena/verse</h1>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 border border-black dark:border-white"
              aria-label="search"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              onClick={toggleDark}
              className="px-3 py-1 border border-black bg-gray-100 dark:bg-gray-800 dark:text-yellow-300 dark:border-gray-400 transition-colors duration-150 hover:bg-gray-200 hover:dark:bg-gray-700"
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
      <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex w-full min-w-0 max-w-full flex-col gap-4 text-sm items-stretch lowercase md:items-start`}>
        <div className="flex w-full min-w-0 max-w-full flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:gap-x-3 md:gap-y-2 lg:gap-x-4">
          <div className="flex min-w-0 w-full flex-1 flex-wrap items-center gap-x-2 gap-y-1 md:w-auto md:items-start md:gap-x-3 lg:gap-x-4">
            <Link href="/" className={`nav-link text-gray-900 w-full md:w-auto${pathname === '/' ? ' active' : ''}`}>home</Link>
            <Link href="/films" className={`nav-link text-blue-600 w-full md:w-auto${pathname?.startsWith('/films') ? ' active' : ''}`}>films</Link>
            <Link href="/music" className={`nav-link text-purple-600 w-full md:w-auto${pathname?.startsWith('/music') ? ' active' : ''}`}>music</Link>
            <Link href="/anime" className={`nav-link text-red-600 w-full md:w-auto${pathname?.startsWith('/anime') ? ' active' : ''}`}>anime</Link>
            <Link href="/books" className={`nav-link text-green-600 w-full md:w-auto${pathname?.startsWith('/books') ? ' active' : ''}`}>books</Link>
            <Link href="/games" className={`nav-link text-cyan-600 w-full md:w-auto${pathname?.startsWith('/games') ? ' active' : ''}`}>games</Link>
            <Link href="/other" className={`nav-link text-yellow-600 w-full md:w-auto${pathname?.startsWith('/other') ? ' active' : ''}`}>other</Link>
            <Link href="/community" className={`nav-link text-pink-600 w-full md:w-auto${pathname?.startsWith('/community') ? ' active' : ''}`}>community</Link>
          </div>
          <div className="flex w-full shrink-0 flex-wrap gap-2 justify-start md:w-auto md:justify-end md:ml-auto">
            {user ? (
              <>
                <Link href="/create-post" className="inline-flex items-center justify-center whitespace-nowrap border-2 border-black bg-white px-3 py-1 text-xs font-bold lowercase text-black transition-colors hover:bg-gray-100 dark:border-white dark:bg-[#0A0A0A] dark:text-white hover:dark:bg-gray-900 text-center">create post</Link>
                <Link href="/profile" className="inline-flex items-center justify-center whitespace-nowrap border-2 border-black bg-white px-3 py-1 text-xs font-bold lowercase text-black transition-colors hover:bg-gray-100 dark:border-white dark:bg-[#0A0A0A] dark:text-white hover:dark:bg-gray-900 text-center">profile</Link>
                <button type="button" onClick={handleLogout} className="inline-flex items-center justify-center whitespace-nowrap border-2 border-black bg-black px-3 py-1 text-xs font-bold lowercase text-center text-white transition-colors hover:bg-gray-900 dark:border-white dark:bg-white dark:text-black hover:dark:bg-gray-200">logout</button>
              </>
            ) : (
              <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap border-2 border-black bg-white px-3 py-1 text-xs font-bold lowercase text-black transition-colors hover:bg-gray-100 dark:border-white dark:bg-white dark:text-black hover:dark:bg-gray-200 text-center">login</Link>
            )}
          </div>
        </div>
      </nav>
      </header>
      <BottomSheet isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} title="search">
        <div className="p-4">
          <SearchBar onClose={() => setIsSearchOpen(false)} isMobile={true} />
        </div>
      </BottomSheet>
    </>
  );
} 