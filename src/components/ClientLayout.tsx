'use client';

import { useState, useEffect } from 'react';
import HeaderWithDarkMode from './HeaderWithDarkMode';


export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isContentVisible, setIsContentVisible] = useState(true);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active &&
        ((active.tagName === 'INPUT') ||
         (active.tagName === 'TEXTAREA') ||
         (active as HTMLElement).isContentEditable);
      if (!isTyping) {
        if (e.key.toLowerCase() === 'h') {
          setIsContentVisible(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8 pb-20 md:pb-8 space-y-4 md:space-y-8">
      <div className="review-card header-card md:!bg-transparent md:!border-0 md:!shadow-none md:!p-0">
        <HeaderWithDarkMode />
      </div>
      <div className={`transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="review-card content-card">
          <main>{children}</main>
        </div>
        <div className="review-card content-card">
          <footer className="mt-0 text-sm text-gray-600 border-t border-gray-300 dark:border-gray-600 pt-4">
            <p>© venaverse</p>
          </footer>
        </div>
      </div>
    </div>
  );
} 