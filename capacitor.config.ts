import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.venaverse.app',
  appName: 'venaverse',
  webDir: 'public', // Using public as webDir since we're using server approach
  server: {
    // Point to your deployed site
    url: 'https://venaverse.net',
    cleartext: false,
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
  },
};

export default config;
