'use client';
import React, { useEffect, useRef, useState } from 'react';

const getCursorImage = (color: string) =>
  `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 2L20 12L13 13L17 21L11 14L3 21V2Z'/%3E%3C/svg%3E`;

const TRAIL_LENGTH = 8;
const LERP = 0.12;

const TrailingCursor: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
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
            opacity: 1 - i / TRAIL_LENGTH,
            filter: `blur(${i}px)`
          }}
        />
      ))}
    </>
  );
};

export default TrailingCursor; 