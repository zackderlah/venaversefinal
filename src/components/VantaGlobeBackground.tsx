'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    VANTA: any;
  }
}

interface VantaGlobeBackgroundProps {
  isActive?: boolean;
  color?: number;
  backgroundColor?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  scale?: number;
  scaleMobile?: number;
}

export default function VantaGlobeBackground({
  isActive = true,
  color = 0xffc8da,
  backgroundColor = 0x3a3343,
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  scale = 1.00,
  scaleMobile = 1.00,
}: VantaGlobeBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Color palette for smooth transitions
  const getColorPalette = () => {
    if (isDarkMode) {
      return [
        0xeb98b1, // Pink
        0xf472b6, // Hot pink
        0xec4899, // Rose
        0xd946ef, // Fuchsia
        0xa855f7, // Purple
        0x8b5cf6, // Violet
        0x7c3aed, // Indigo
        0x6366f1, // Blue
        0x3b82f6, // Sky blue
        0x06b6d4, // Cyan
        0x0891b2, // Teal
        0x10b981, // Emerald
        0x34d399, // Green
        0x84cc16, // Lime
        0xeab308, // Yellow
        0xf59e0b, // Amber
        0xf97316, // Orange
        0xef4444, // Red
        0xf43f5e, // Rose red
        0xec4899, // Pink
      ];
    } else {
      return [
        0x372637, // Dark purple
        0x4c1d95, // Deep purple
        0x5b21b6, // Purple
        0x6d28d9, // Violet
        0x7c3aed, // Indigo
        0x8b5cf6, // Purple
        0x9333ea, // Violet
        0xa855f7, // Purple
        0xbe185d, // Rose
        0xbe123c, // Rose red
        0xdc2626, // Red
        0xea580c, // Orange
        0xd97706, // Amber
        0xca8a04, // Yellow
        0x65a30d, // Lime
        0x16a34a, // Green
        0x059669, // Emerald
        0x0d9488, // Teal
        0x0891b2, // Cyan
        0x0284c7, // Sky blue
      ];
    }
  };

  // Get current color based on time
  const getCurrentColor = () => {
    const palette = getColorPalette();
    const time = Date.now() / 1000; // Very fast transition (1 second per cycle)
    const index = Math.floor(time) % palette.length;
    const nextIndex = (index + 1) % palette.length;
    const progress = time - Math.floor(time);
    
    // Interpolate between current and next color
    const currentColor = palette[index];
    const nextColor = palette[nextIndex];
    
    // Simple linear interpolation
    const r1 = (currentColor >> 16) & 0xff;
    const g1 = (currentColor >> 8) & 0xff;
    const b1 = currentColor & 0xff;
    
    const r2 = (nextColor >> 16) & 0xff;
    const g2 = (nextColor >> 8) & 0xff;
    const b2 = nextColor & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    return (r << 16) | (g << 8) | b;
  };

  // Get theme-appropriate colors
  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        color: getCurrentColor(),
        backgroundColor: 0x1e293b // Dark slate background
      };
    } else {
      return {
        color: getCurrentColor(),
        backgroundColor: 0xf1f5f9 // Less bright light background
      };
    }
  };

  // Initialize VANTA.GLOBE once
  useEffect(() => {
    if (isActive && vantaRef.current && !vantaEffect.current) {
      // Load Three.js and VANTA.GLOBE scripts
      const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
          // Check if script already exists
          const existingScript = document.querySelector(`script[src="${src}"]`);
          if (existingScript) {
            resolve(true);
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      const initVanta = async () => {
        try {
          // Load Three.js first
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
          // Then load VANTA.GLOBE
          await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js');
          
          // Wait a bit for the scripts to be fully loaded
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get current theme colors
          const themeColors = getThemeColors();
          
          // Initialize VANTA.GLOBE with theme colors
          if (window.VANTA && window.VANTA.GLOBE) {
            vantaEffect.current = window.VANTA.GLOBE({
              el: vantaRef.current,
              mouseControls,
              touchControls,
              gyroControls,
              minHeight: 200.00,
              minWidth: 200.00,
              scale,
              scaleMobile,
              color: themeColors.color,
              backgroundColor: themeColors.backgroundColor
            });
          }
        } catch (error) {
          console.error('Failed to load VANTA.GLOBE:', error);
        }
      };

      initVanta();
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [isActive, mouseControls, touchControls, gyroControls, scale, scaleMobile]);

  // Update colors when theme changes (preserve state)
  useEffect(() => {
    if (vantaEffect.current && window.VANTA) {
      const themeColors = getThemeColors();
      
      // Update colors without destroying the effect
      try {
        vantaEffect.current.setOptions({
          color: themeColors.color,
          backgroundColor: themeColors.backgroundColor
        });
      } catch (error) {
        // If setOptions doesn't work, we'll need to recreate
        console.log('Updating VANTA colors via recreation');
        const currentState = vantaEffect.current;
        vantaEffect.current.destroy();
        
        vantaEffect.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls,
          touchControls,
          gyroControls,
          minHeight: 200.00,
          minWidth: 200.00,
          scale,
          scaleMobile,
          color: themeColors.color,
          backgroundColor: themeColors.backgroundColor
        });
      }
    }
  }, [isDarkMode]);

  // Continuous color animation
  useEffect(() => {
    if (!vantaEffect.current || !window.VANTA) return;

    const updateColors = () => {
      if (vantaEffect.current) {
        const themeColors = getThemeColors();
        try {
          vantaEffect.current.setOptions({
            color: themeColors.color,
            backgroundColor: themeColors.backgroundColor
          });
        } catch (error) {
          // Silently handle errors to avoid console spam
        }
      }
    };

    // Update colors every 100ms for smooth animation
    const interval = setInterval(updateColors, 100);

    return () => clearInterval(interval);
  }, [vantaEffect.current, isDarkMode]);

  if (!isActive) {
    return null;
  }

  const themeColors = getThemeColors();
  const fallbackBg = isDarkMode ? '#1e293b' : '#f1f5f9';

  return (
    <div 
      ref={vantaRef}
      className="fixed inset-0 z-0"
      style={{ 
        width: '100%', 
        height: '100vh',
        backgroundColor: fallbackBg // Theme-aware fallback background color
      }}
    />
  );
}
