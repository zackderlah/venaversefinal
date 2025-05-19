'use client';

import { useState, useEffect } from 'react';
import HeaderWithDarkMode from './HeaderWithDarkMode';

// List of all bg images in public folder
const BG_IMAGES = [
  '/bg2.jpg',
  '/bg4.jpg',
  '/bg5.jpg',
  '/bg6.jpg',
  '/bg7.png',
  '/bg12.jpeg',
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  // Load bg index from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bgIndex');
    if (stored && !isNaN(Number(stored))) {
      setBgIndex(Number(stored));
    }
  }, []);

  // Set body background for fallback/SEO
  useEffect(() => {
    document.body.style.backgroundImage = `url('${BG_IMAGES[bgIndex]}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
  }, [bgIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        if (e.key === 'ArrowLeft') {
          setBgIndex(idx => (idx - 1 + BG_IMAGES.length) % BG_IMAGES.length);
          localStorage.setItem('bgIndex', String((bgIndex - 1 + BG_IMAGES.length) % BG_IMAGES.length));
        } else if (e.key === 'ArrowRight') {
          setBgIndex(idx => (idx + 1) % BG_IMAGES.length);
          localStorage.setItem('bgIndex', String((bgIndex + 1) % BG_IMAGES.length));
        } else if (e.key.toLowerCase() === 'h') {
          setIsContentVisible(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [bgIndex]);

  return (
    <>
      <div
        style={{
          backgroundImage: `url('${BG_IMAGES[bgIndex]}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
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
    </>
  );
} 