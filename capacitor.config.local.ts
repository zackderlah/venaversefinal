import type { CapacitorConfig } from '@capacitor/cli';

// Local development configuration
// Use this when testing locally: npx cap sync android --config capacitor.config.local.ts
const config: CapacitorConfig = {
  appId: 'com.venaverse.app',
  appName: 'venaverse',
  webDir: 'public',
  server: {
    // Point to local dev server
    url: 'http://localhost:3000',
    cleartext: true, // Allow HTTP for localhost
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0A',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0A',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;

