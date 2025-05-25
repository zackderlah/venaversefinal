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
  const [cursorStyle, setCursorStyle] = useState('default');
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

      // Get the computed cursor style of the element under the mouse
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        const newCursorStyle = computedStyle.cursor;
        if (newCursorStyle !== cursorStyle) {
          setCursorStyle(newCursorStyle);
        }
      }
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
  }, [cursorStyle]);

  // Get the appropriate cursor image based on the current style
  const getCursorImageForStyle = () => {
    if (cursorStyle === 'pointer' || cursorStyle === 'text') {
      // For pointer and text cursors, use a different SVG path
      const path = cursorStyle === 'pointer' 
        // SVG path for a simple hand cursor (open hand)
        ? 'M7 2C6.44772 2 6 2.44772 6 3V13.382C5.4022 13.7912 5 14.4696 5 15.2361V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V8C19 7.44772 18.5523 7 18 7C17.4477 7 17 7.44772 17 8V13H16V4C16 3.44772 15.5523 3 15 3C14.4477 3 14 3.44772 14 4V13H13V6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6V13H10V8C10 7.44772 9.55228 7 9 7C8.44772 7 8 7.44772 8 8V13.382V3C8 2.44772 7.55228 2 7 2Z' 
        // SVG path for I-beam (text cursor)
        : 'M11 2L13 2L13 22L11 22Z';
      return `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='${encodeURIComponent(isDark ? 'white' : 'black')}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${path}'/%3E%3C/svg%3E`;
    }
    return getCursorImage(isDark ? 'white' : 'black');
  };

  const cursorImage = getCursorImageForStyle();

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