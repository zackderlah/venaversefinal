'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return; // Only enable on native platforms

    let touchStartY = 0;
    let currentPull = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        setStartY(touchStartY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === 0) return;
      
      const currentY = e.touches[0].clientY;
      const pull = Math.max(0, currentY - touchStartY);
      
      if (pull > 0 && window.scrollY === 0) {
        e.preventDefault();
        currentPull = Math.min(pull, 100);
        setPullDistance(currentPull);
        setIsPulling(true);
      }
    };

    const handleTouchEnd = async () => {
      if (currentPull > 50 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      setPullDistance(0);
      setIsPulling(false);
      touchStartY = 0;
      currentPull = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, isRefreshing, isNative]);

  return (
    <div className="relative">
      {isPulling && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black dark:bg-gray-900 text-white"
          style={{
            height: `${Math.min(pullDistance, 100)}px`,
            transform: `translateY(${Math.min(pullDistance - 100, 0)}px)`,
            transition: isRefreshing ? 'none' : 'transform 0.2s',
          }}
        >
          {isRefreshing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm lowercase">refreshing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 transform rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="text-sm lowercase">pull to refresh</span>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

