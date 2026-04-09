"use client";

import React, { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function LoadingSpinner() {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const overlay = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 dark:bg-white/20 backdrop-blur-sm">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent animate-spin dark:border-t-white"></div>
        <div
          className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-black border-b-transparent border-l-transparent animate-spin dark:border-r-white"
          style={{ animationDelay: "-0.5s" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-b-black border-l-transparent animate-spin dark:border-b-white"
          style={{ animationDelay: "-1s" }}
        ></div>
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

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(overlay, document.body);
}
