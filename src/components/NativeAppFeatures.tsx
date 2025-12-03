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

    const addHapticsToClickableElements = () => {
      // Select all clickable elements
      const clickableSelectors = [
        'button',
        'a[href]',
        '.review-card-item',
        '[role="button"]',
        '[onclick]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        'label[for]', // Labels that trigger inputs
        '.nav-link',
        '.category-button',
        '[data-clickable]', // Any element marked as clickable
      ].join(', ');

      const clickableElements = document.querySelectorAll(clickableSelectors);
      
      const handleInteraction = (e: Event) => {
        // Only trigger on actual touch, not programmatic touches
        const touchEvent = e as TouchEvent;
        if (touchEvent.touches && touchEvent.touches.length > 0) {
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        }
      };

      // Also handle click events for elements that might not have touch events
      const handleClick = () => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      };

      clickableElements.forEach(element => {
        element.addEventListener('touchstart', handleInteraction as EventListener, { passive: true });
        element.addEventListener('click', handleClick, { passive: true });
      });

      return () => {
        clickableElements.forEach(element => {
          element.removeEventListener('touchstart', handleInteraction as EventListener);
          element.removeEventListener('click', handleClick);
        });
      };
    };

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(() => {
      // Re-run when DOM changes
      const cleanup = addHapticsToClickableElements();
      return cleanup;
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const cleanup = addHapticsToClickableElements();
    
    return () => {
      cleanup();
      observer.disconnect();
    };
  }, [pathname, isNative]);

  return null;
}

