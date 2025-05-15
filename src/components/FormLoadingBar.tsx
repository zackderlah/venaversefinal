"use client";

import React from 'react';

export default function FormLoadingBar({ loading }: { loading: boolean }) {
  return loading ? (
    <div className="w-full flex justify-center mb-4">
      <div className="relative w-48 h-6 bg-black border-4 border-pink-500 rounded-md overflow-hidden pixel-bar">
        <div className="absolute top-0 left-0 h-full bg-pink-500 animate-form-bar" style={{ width: '100%' }} />
        <span className="absolute w-full text-center text-xs font-mono text-white z-10" style={{ lineHeight: '1.5rem' }}>
          loading...
        </span>
      </div>
      <style jsx global>{`
        .pixel-bar {
          image-rendering: pixelated;
        }
        @keyframes form-bar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-form-bar {
          animation: form-bar 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
      `}</style>
    </div>
  ) : null;
} 