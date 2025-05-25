'use client';
import React, { useEffect, useRef, useState } from 'react';

const CURSOR_PATH = 'M2 2L20 12L13 13L17 22L11 14L2 22Z';
const TRAIL_LENGTH = 8;
const LERP = 0.12;
const CATCHUP_DIST = 2; // px
const IDLE_TIME = 60; // ms

const getCursorImage = (color: string) =>
  `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${CURSOR_PATH}'/%3E%3C/svg%3E`;

const TrailingCursor: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const lastMove = useRef(Date.now());
  const trailRefs = useRef<(HTMLImageElement | null)[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const trail = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 }))
  );

  useEffect(() => {
    // Detect dark mode
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      lastMove.current = Date.now();
      setShowTrail(true);
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // The first ghost follows the mouse, the rest follow the previous
      trail.current.forEach((pos, i) => {
        const target = i === 0 ? mouse.current : trail.current[i - 1];
        pos.x += (target.x - pos.x) * LERP;
        pos.y += (target.y - pos.y) * LERP;
        if (trailRefs.current[i]) {
          trailRefs.current[i]!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }
      });

      // Check if all trail points are close to the mouse and mouse is idle
      const allCaughtUp = trail.current.every(
        pos => Math.hypot(pos.x - mouse.current.x, pos.y - mouse.current.y) < CATCHUP_DIST
      );
      if (allCaughtUp && Date.now() - lastMove.current > IDLE_TIME) {
        setShowTrail(false);
      }

      requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const cursorImage = getCursorImage(isDark ? 'white' : 'black');

  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <img
          key={i}
          ref={el => { trailRefs.current[i] = el; }}
          src={cursorImage}
          alt="ghost cursor"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 24,
            height: 24,
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: showTrail ? 1 - i / TRAIL_LENGTH : 0,
            filter: `blur(${i}px)`
          }}
        />
      ))}
    </>
  );
};

export default TrailingCursor; 