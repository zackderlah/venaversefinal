'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import NavSearch from './NavSearch';

const NAV_LINKS = [
  { href: '/', label: 'home', dot: null },
  { href: '/films', label: 'film/tv', dot: 'bg-blue-500' },
  { href: '/music', label: 'music', dot: 'bg-purple-500' },
  { href: '/anime', label: 'anime', dot: 'bg-red-500' },
  { href: '/books', label: 'books', dot: 'bg-green-500' },
  { href: '/games', label: 'games', dot: 'bg-cyan-500' },
  { href: '/other', label: 'other', dot: 'bg-yellow-500' },
  { href: '/community', label: 'community', dot: 'bg-pink-500' },
];

function SearchIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
    </svg>
  );
}

function ThemeIcon({ isDark }: { isDark: boolean }) {
  return isDark ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.4 14.5A8.5 8.5 0 019.5 3.6a8.5 8.5 0 1010.9 10.9z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="4" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default function HeaderWithDarkMode() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

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

  // Close the mobile menu and search row after navigating.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) mobileSearchRef.current?.focus();
  }, [isSearchOpen]);

  // Ctrl/Cmd+K focuses the navbar search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.matchMedia('(min-width: 1024px)').matches) {
          desktopSearchRef.current?.focus();
        } else {
          setIsMenuOpen(false);
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // redirect: false + refresh so SessionProvider and RSC layout see cleared cookies (avoids stale "logged in" header)
    await signOut({ redirect: false });
    router.refresh();
    router.push('/login');
  };

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  const renderNavLinks = (links: typeof NAV_LINKS) => links.map(({ href, label, dot }) => (
    <Link
      key={href}
      href={href}
      className="vv-pill"
      aria-current={isActive(href) ? 'page' : undefined}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />}
      {label}
    </Link>
  ));

  return (
    <>
      <header className="vv-header sticky top-0 z-40 safe-area-top">
        <div className="vv-frame !bg-transparent mx-auto flex h-16 max-w-layout items-center gap-3 px-4 md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="vena/verse home">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-vv-fg text-[15px] font-bold leading-none text-vv-bg">
              v
            </span>
            <span className="text-[15px] font-semibold tracking-tight lowercase">vena/verse</span>
          </Link>

          {/* The logo already links home, so the inline nav skips it. */}
          <nav className="hidden min-w-0 items-center xl:flex" aria-label="main">
            {renderNavLinks(NAV_LINKS.filter(link => link.href !== '/'))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="hidden lg:block">
              <NavSearch inputRef={desktopSearchRef} />
            </span>
            <button
              type="button"
              onClick={() => { setIsMenuOpen(false); setIsSearchOpen(open => !open); }}
              className="vv-icon-btn lg:hidden"
              aria-label="search"
              aria-expanded={isSearchOpen}
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={toggleDark}
              className="vv-icon-btn"
              aria-label={isDark ? 'switch to light mode' : 'switch to dark mode'}
            >
              <ThemeIcon isDark={isDark} />
            </button>

            <span className="hidden items-center gap-2 xl:flex">
              {user ? (
                <>
                  <Link href="/create-post" className="vv-btn vv-btn-solid">+ review</Link>
                  <Link href="/profile" className="vv-icon-btn" aria-label="profile" title="profile">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <circle cx="12" cy="8" r="4" strokeWidth={2} />
                      <path strokeLinecap="round" strokeWidth={2} d="M4 21a8 8 0 0116 0" />
                    </svg>
                  </Link>
                  <button type="button" onClick={handleLogout} className="vv-icon-btn" aria-label="logout" title="logout">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17l5-5-5-5M20 12H9M12 21H5a1 1 0 01-1-1V4a1 1 0 011-1h7" />
                    </svg>
                  </button>
                </>
              ) : (
                <Link href="/login" className="vv-btn vv-btn-solid">login</Link>
              )}
            </span>

            <button
              type="button"
              onClick={() => { setIsSearchOpen(false); setIsMenuOpen(open => !open); }}
              className="vv-icon-btn xl:hidden"
              aria-label="toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className={`relative block w-4 ${isMenuOpen ? 'h-0' : 'h-px bg-current'}`}>
                <span className={`absolute block h-px w-full bg-current transition-all duration-300 ${isMenuOpen ? 'top-0 rotate-45' : '-translate-y-1.5'}`} />
                <span className={`absolute block h-px w-full bg-current transition-all duration-300 ${isMenuOpen ? 'top-0 -rotate-45' : 'translate-y-1.5'}`} />
              </span>
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-t border-vv-line lg:hidden">
            <div className="vv-frame !bg-transparent mx-auto flex max-w-layout items-center px-4 py-3 md:px-6">
              <NavSearch
                variant="full"
                inputRef={mobileSearchRef}
                onNavigate={() => setIsSearchOpen(false)}
                onEscape={() => setIsSearchOpen(false)}
              />
            </div>
          </div>
        )}

        {isMenuOpen && (
          <div className="border-t border-vv-line xl:hidden">
            <div className="vv-frame !bg-transparent mx-auto max-w-layout px-4 py-4 md:px-6">
              <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4" aria-label="main">
                {renderNavLinks(NAV_LINKS)}
              </nav>
              <span className="mt-4 flex flex-wrap gap-2 border-t border-vv-line pt-4">
                {user ? (
                  <>
                    <Link href="/create-post" className="vv-btn vv-btn-solid">+ review</Link>
                    <Link href="/profile" className="vv-btn">profile</Link>
                    <button type="button" onClick={handleLogout} className="vv-btn">logout</button>
                  </>
                ) : (
                  <Link href="/login" className="vv-btn vv-btn-solid">login</Link>
                )}
              </span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
