'use client';

import { useEffect, useState } from 'react';

export default function DeferredVisualEffects() {
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    const idleCallback = (window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    }).requestIdleCallback;
    const cancelIdleCallback = (window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    }).cancelIdleCallback;

    if (idleCallback) {
      const id = idleCallback(() => setShowEffects(true));
      return () => {
        if (cancelIdleCallback) cancelIdleCallback(id);
      };
    }

    const timeoutId = window.setTimeout(() => setShowEffects(true), 1000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!showEffects) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <iframe
        src="https://caustic.wtf/e/R7BF-734G"
        title="Animated site background"
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 scale-[1.02] border-0"
        style={{
          // Cover the viewport at the canvas aspect ratio; overscan hides rounded edges.
          width: 'max(100vw, 177.631579dvh)',
          height: 'max(100dvh, 56.296296vw)',
        }}
        loading="lazy"
        tabIndex={-1}
      />
    </div>
  );
}
