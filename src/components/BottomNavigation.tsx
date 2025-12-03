'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'home', icon: '🏠' },
    { href: '/films', label: 'films', icon: '🎬' },
    { href: '/music', label: 'music', icon: '🎵' },
    { href: '/community', label: 'community', icon: '👥' },
    { href: '/profile', label: 'profile', icon: '👤' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0A0A0A] border-t-2 border-black dark:border-white md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-bold lowercase tracking-tight">
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

