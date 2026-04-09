'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxHeight?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = '90vh',
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0].clientY > (sheetRef.current?.offsetTop || 0) + 50) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY;
    const diff = y - startY;
    if (diff > 0) {
      setCurrentY(y);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const diff = currentY - startY;
    if (diff > 100) {
      // Close if dragged down more than 100px
      if (isNative) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
      onClose();
    }
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  // Portal to document.body so fixed positioning is not trapped by ancestor
  // backdrop-filter / overflow (e.g. .review-card.content-card).
  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-[100] transition-opacity"
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0 }}
        aria-hidden
      />
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[110] bg-white dark:bg-[#0A0A0A] rounded-t-2xl border-t-2 border-black dark:border-white shadow-2xl safe-area-bottom"
        style={{
          transform: `translateY(${translateY}px)`,
          maxHeight,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
        </div>
        {title && (
          <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-800">
            <h3 id={titleId} className="text-xl font-black lowercase tracking-tight">
              {title}
            </h3>
          </div>
        )}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 60px)` }}>
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}

