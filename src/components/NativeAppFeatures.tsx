'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Keyboard, KeyboardStyle } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export default function NativeAppFeatures() {
  const router = useRouter();
  const pathname = usePathname();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    // Configure Status Bar
    const setupStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0A0A0A' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.log('Status bar not available:', error);
      }
    };

    // Handle Android back button
    const setupBackButton = () => {
      const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          router.back();
          // Haptic feedback
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        } else {
          // Exit app if at root
          App.exitApp().catch(() => {});
        }
      });

      return () => {
        backButtonListener.then(listener => listener.remove()).catch(() => {});
      };
    };

    // Handle app state changes
    const setupAppState = () => {
      const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App came to foreground
          setupStatusBar();
        }
      });

      return () => {
        appStateListener.then(listener => listener.remove()).catch(() => {});
      };
    };

    // Configure keyboard
    const setupKeyboard = () => {
      try {
        Keyboard.setAccessoryBarVisible({ isVisible: true });
        Keyboard.setScroll({ isDisabled: false });
        Keyboard.setStyle({ style: KeyboardStyle.Dark });
      } catch (error) {
        console.log('Keyboard not available:', error);
      }
    };

    setupStatusBar();
    setupKeyboard();
    const removeBackButton = setupBackButton();
    const removeAppState = setupAppState();

    return () => {
      removeBackButton();
      removeAppState();
    };
  }, [router, isNative]);

  // Add haptic feedback to all clickable/interactive elements
  useEffect(() => {
    if (!isNative) return;

    // Track elements that already have haptics to avoid duplicates
    const hapticsElements = new WeakSet<Element>();
    let lastHapticTime = 0;
    const HAPTIC_COOLDOWN = 50; // Prevent multiple haptics within 50ms

    const triggerHaptic = () => {
      const now = Date.now();
      if (now - lastHapticTime < HAPTIC_COOLDOWN) return;
      lastHapticTime = now;
      
      Haptics.impact({ style: ImpactStyle.Light }).catch((err) => {
        console.log('Haptics error:', err);
      });
    };

    const addHapticsToElement = (element: Element) => {
      // Skip if already processed
      if (hapticsElements.has(element)) return;
      hapticsElements.add(element);

      // Handle touch events (primary for mobile)
      const handleTouchStart = (e: TouchEvent) => {
        e.stopPropagation(); // Prevent event bubbling issues
        triggerHaptic();
      };

      // Handle click events (fallback)
      const handleClick = (e: MouseEvent) => {
        // Only trigger if it's not from a touch event (to avoid double haptics)
        if (!(e as any).isTrusted || (e as any).sourceCapabilities?.firesTouchEvents) {
          return;
        }
        triggerHaptic();
      };

      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('click', handleClick, { passive: true });
    };

    const addHapticsToClickableElements = () => {
      // Select all clickable elements
      const clickableSelectors = [
        'button:not([disabled])',
        'a[href]:not([href=""])',
        '.review-card-item',
        '[role="button"]:not([aria-disabled="true"])',
        'input[type="button"]:not([disabled])',
        'input[type="submit"]:not([disabled])',
        'input[type="reset"]:not([disabled])',
        'label[for]',
        '.nav-link',
        '.category-button',
        '[data-clickable]',
        'Link', // Next.js Link components
      ];

      clickableSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(addHapticsToElement);
        } catch (err) {
          console.log('Error selecting elements:', selector, err);
        }
      });
    };

    // Initial setup
    addHapticsToClickableElements();

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if the added element itself is clickable
            const clickableSelectors = [
              'button',
              'a[href]',
              '.review-card-item',
              '[role="button"]',
              'input[type="button"]',
              'input[type="submit"]',
              'input[type="reset"]',
              'label[for]',
              '.nav-link',
              '.category-button',
              '[data-clickable]',
            ];
            
            clickableSelectors.forEach(selector => {
              if (element.matches && element.matches(selector)) {
                addHapticsToElement(element);
              }
            });
            
            // Also check children
            clickableSelectors.forEach(selector => {
              const children = element.querySelectorAll?.(selector);
              children?.forEach(addHapticsToElement);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    return () => {
      observer.disconnect();
      // Note: We don't remove event listeners here because elements might be removed from DOM
      // and WeakSet will handle cleanup automatically
    };
  }, [pathname, isNative]);

  return null;
}

