"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function GlobalLoadingBar() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleStart = () => {
      // Add a slight delay to avoid flashing for very fast transitions
      timeout = setTimeout(() => setLoading(true), 100);
    };
    const handleStop = () => {
      clearTimeout(timeout);
      setLoading(false);
    };
    // Listen to router events
    // @ts-ignore
    if (router && router.events) {
      // @ts-ignore
      router.events.on('routeChangeStart', handleStart);
      // @ts-ignore
      router.events.on('routeChangeComplete', handleStop);
      // @ts-ignore
      router.events.on('routeChangeError', handleStop);
      return () => {
        // @ts-ignore
        router.events.off('routeChangeStart', handleStart);
        // @ts-ignore
        router.events.off('routeChangeComplete', handleStop);
        // @ts-ignore
        router.events.off('routeChangeError', handleStop);
      };
    }
  }, [router]);

  // Fallback for Next.js app router navigation
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 dark:bg-white/20 pointer-events-none">
      <div className="relative w-56 h-8 bg-white dark:bg-black border-4 border-black dark:border-white rounded-md overflow-hidden pixel-bar">
        <div className="absolute top-0 left-0 h-full bg-black dark:bg-white animate-global-bar" style={{ width: '100%' }} />
        <span className="absolute w-full text-center text-xs font-mono text-black dark:text-white z-10" style={{ lineHeight: '2rem' }}>
          loading...
        </span>
      </div>
      <style jsx global>{`
        .pixel-bar {
          image-rendering: pixelated;
        }
        @keyframes global-bar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-global-bar {
          animation: global-bar 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
      `}</style>
    </div>
  );
} 