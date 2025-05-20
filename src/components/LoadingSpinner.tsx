"use client";

import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 dark:bg-white/20 backdrop-blur-sm">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-t-black dark:border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-4 border-t-transparent border-r-black dark:border-r-white border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
        <div className="absolute inset-0 border-4 border-t-transparent border-r-transparent border-b-black dark:border-b-white border-l-transparent rounded-full animate-spin" style={{ animationDelay: '-1s' }}></div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
} 