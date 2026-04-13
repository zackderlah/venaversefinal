'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const VantaGlobeBackground = dynamic(() => import('./VantaGlobeBackground'), { ssr: false });
const TrailingCursor = dynamic(() => import('./TrailingCursor'), { ssr: false });

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
    <>
      <VantaGlobeBackground isActive={true} />
      <TrailingCursor />
    </>
  );
}
