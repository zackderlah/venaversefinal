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
      // Only trigger if not in an input/textarea
      if (
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        e.key.toLowerCase() === 'h'
      ) {
        setIsContentVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="review-card">
        <HeaderWithDarkMode />
      </div>
      <div className={`transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="review-card">
          <main>{children}</main>
        </div>
        <div className="review-card">
          <footer className="mt-0 text-sm text-gray-600 border-t-2 border-black pt-4">
            <p>© venaverse</p>
          </footer>
        </div>
      </div>
    </div>
  );
} 