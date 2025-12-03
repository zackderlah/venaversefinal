# Native App Guide - Using Capacitor

This guide will help you create a native iOS and Android app from your Next.js website using Capacitor.

## What is Capacitor?

Capacitor wraps your web app in a native container, allowing you to:
- Publish to App Store and Google Play
- Access native device features (camera, notifications, etc.)
- Use your existing Next.js codebase
- Build native apps without rewriting your code

---

## Prerequisites

### For iOS:
- **Mac computer** (required for iOS development)
- **Xcode** (free from Mac App Store)
- **Apple Developer Account** ($99/year for App Store publishing)

### For Android:
- **Any computer** (Windows, Mac, or Linux)
- **Android Studio** (free download)
- **Google Play Developer Account** ($25 one-time fee)

---

## Step-by-Step Setup

### Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### Step 2: Initialize Capacitor

```bash
npx cap init
```

You'll be prompted for:
- **App name**: `venaverse` (or `vena/verse`)
- **App ID**: `com.venaverse.app` (or your preferred bundle ID)
- **Web directory**: `out` (for static export) or `.next` (for server-side)

**Important**: Since Next.js uses server-side rendering, you'll need to either:
- **Option A**: Export as static site (recommended for Capacitor)
- **Option B**: Run Next.js server and point Capacitor to it

### Step 3: Configure Next.js for Static Export (Recommended)

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Add this for static export
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      // ... your existing patterns
    ],
  },
  // ... rest of your config
};
module.exports = nextConfig;
```

**Note**: Static export means:
- ✅ Works great with Capacitor
- ✅ No server needed
- ❌ No API routes (you'll need to use external API)
- ❌ No server-side features

### Step 4: Build Your App

```bash
npm run build
```

This creates an `out` folder with your static site.

### Step 5: Update Capacitor Configuration

Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.venaverse.app',
  appName: 'venaverse',
  webDir: 'out', // or '.next' if using server
  server: {
    // If using Next.js server, uncomment:
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
    },
  },
};

export default config;
```

### Step 6: Add Native Platforms

```bash
# Add iOS (Mac only)
npx cap add ios

# Add Android
npx cap add android
```

### Step 7: Sync Your App

```bash
npx cap sync
```

This copies your web app into the native projects.

### Step 8: Open in Native IDEs

```bash
# iOS (Mac only)
npx cap open ios

# Android
npx cap open android
```

---

## Building for iOS

1. **Open Xcode**:
   ```bash
   npx cap open ios
   ```

2. **Configure Signing**:
   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Select your team
   - Xcode will create a provisioning profile

3. **Build**:
   - Select a device or simulator
   - Click the Play button or press `Cmd + R`

4. **Archive for App Store**:
   - Product → Archive
   - Follow the App Store submission process

---

## Building for Android

1. **Open Android Studio**:
   ```bash
   npx cap open android
   ```

2. **Build APK**:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be in `android/app/build/outputs/apk/`

3. **Build AAB (for Play Store)**:
   - Build → Build Bundle(s) / APK(s) → Build Bundle(s)
   - AAB will be in `android/app/build/outputs/bundle/`

---

## Important Considerations

### API Routes

Since static export doesn't support API routes, you have options:

1. **Use External API**:
   - Deploy your Next.js API routes separately (Vercel, etc.)
   - Point your app to the deployed API URL

2. **Use Capacitor HTTP Plugin**:
   ```bash
   npm install @capacitor/http
   ```
   - Make API calls to your deployed backend

### Database

- Your Prisma database won't work in the app
- You'll need to:
  - Deploy your API separately
  - Use the deployed API from the app
  - Or use a mobile database like SQLite with Capacitor

### Updates

- **Web updates**: Rebuild and resync
  ```bash
  npm run build
  npx cap sync
  ```
- **Native updates**: Rebuild in Xcode/Android Studio

---

## Alternative: Next.js Server Approach

If you want to keep server-side features:

1. **Deploy Next.js** to a server (Vercel, etc.)
2. **Point Capacitor to your server**:
   ```typescript
   // capacitor.config.ts
   server: {
     url: 'https://your-app.vercel.app',
     cleartext: false
   }
   ```
3. **Build native app** that loads your web app

**Pros**: Keep all Next.js features
**Cons**: Requires internet connection, slower initial load

---

## Recommended Workflow

1. **Development**:
   ```bash
   npm run dev
   # Test in browser
   ```

2. **Build for Native**:
   ```bash
   npm run build
   npx cap sync
   npx cap open ios    # or android
   ```

3. **Test on Device**:
   - Connect device
   - Run from Xcode/Android Studio

4. **Deploy**:
   - Submit to App Store / Play Store

---

## Useful Capacitor Plugins

```bash
# Camera
npm install @capacitor/camera

# Notifications
npm install @capacitor/push-notifications

# Storage
npm install @capacitor/preferences

# Share
npm install @capacitor/share

# Status Bar
npm install @capacitor/status-bar
```

---

## Troubleshooting

### "WebDir does not exist"
- Make sure you've run `npm run build`
- Check that `out` folder exists
- Verify path in `capacitor.config.ts`

### API Routes Not Working
- Static export doesn't support API routes
- Deploy API separately or use server approach

### Build Errors
- Make sure all dependencies are installed
- Run `npx cap sync` after any changes
- Clean build folders in Xcode/Android Studio

---

## Next Steps

1. ✅ Install Capacitor
2. ✅ Configure Next.js for static export (or use server)
3. ✅ Add iOS/Android platforms
4. ✅ Test on simulators/devices
5. ✅ Submit to app stores

Need help with any step? Let me know!

