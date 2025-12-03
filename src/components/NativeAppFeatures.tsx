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

  // Add haptic feedback to interactive elements
  useEffect(() => {
    if (!isNative) return;

    const addHapticsToButtons = () => {
      const buttons = document.querySelectorAll('button, a[href], .review-card-item');
      const handleInteraction = () => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      };

      buttons.forEach(button => {
        button.addEventListener('touchstart', handleInteraction, { passive: true });
      });

      return () => {
        buttons.forEach(button => {
          button.removeEventListener('touchstart', handleInteraction);
        });
      };
    };

    const cleanup = addHapticsToButtons();
    return cleanup;
  }, [pathname, isNative]);

  return null;
}

