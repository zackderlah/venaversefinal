'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderWithDarkMode from './HeaderWithDarkMode';
import FrameRule from './FrameRule';


export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isContentVisible, setIsContentVisible] = useState(true);
  const pathname = usePathname();
  // The homepage lays out its own full-bleed sections; other pages get standard frame padding.
  const isHome = pathname === '/';

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active &&
        ((active.tagName === 'INPUT') ||
         (active.tagName === 'TEXTAREA') ||
         (active as HTMLElement).isContentEditable);
      if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key.toLowerCase() === 'h') {
          setIsContentVisible(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="vv-shell relative z-10 min-h-screen">
      <HeaderWithDarkMode />
      <div
        className={`vv-frame mx-auto flex min-h-[calc(100vh-4rem)] max-w-layout flex-col pb-20 md:pb-0 transition-opacity duration-300 ${
          isContentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <main className="flex-1">
          {isHome ? (
            children
          ) : (
            <div className="px-5 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16">{children}</div>
          )}
        </main>
        <FrameRule />
        <footer className="flex items-center justify-between px-5 py-6 text-[13px] text-vv-faint md:px-8">
          <span className="lowercase">© venaverse</span>
          <span className="vv-eyebrow">vena/verse</span>
        </footer>
      </div>
    </div>
  );
}
