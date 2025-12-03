# Android App Build Guide

Your Android app is now set up! Here's how to build and test it.

## Prerequisites

**⚠️ Android Studio must be installed first!**

If you don't have Android Studio:
- See `INSTALL_ANDROID_STUDIO.md` for installation instructions
- Or download from: https://developer.android.com/studio

## Quick Start

### 1. Open Android Studio

```bash
npm run cap:open
```

Or manually:
```bash
npx cap open android
```

**If Android Studio doesn't open**, it's likely not installed. See installation guide above.

### 2. Build APK (for testing)

1. In Android Studio, go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for the build to complete
3. APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Install on your device by transferring the APK file

### 3. Build AAB (for Google Play Store)

1. In Android Studio, go to **Build → Build Bundle(s) / APK(s) → Build Bundle(s)**
2. Wait for the build to complete
3. AAB will be located at: `android/app/build/outputs/bundle/release/app-release.aab`
4. Upload this to Google Play Console

## Configuration

### Current Setup

- **App Name**: venaverse
- **Package ID**: com.venaverse.app
- **Server URL**: https://venaverse.net
- **Web Directory**: public

### Changing Server URL

Edit `capacitor.config.ts`:

```typescript
server: {
  url: 'https://your-domain.com',  // Change this
  cleartext: false,
}
```

Then sync:
```bash
npm run cap:sync
```

### For Local Development

Edit `capacitor.config.ts`:

```typescript
server: {
  url: 'http://localhost:3000',  // or your local IP
  cleartext: true,
}
```

**Note**: Make sure your phone and computer are on the same network, and use your computer's IP address instead of localhost.

## Testing on Device

### Option 1: USB Debugging

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. In Android Studio, select your device from the device dropdown
5. Click Run (green play button)

### Option 2: Install APK Directly

1. Build APK (see above)
2. Transfer `app-debug.apk` to your device
3. Enable "Install from Unknown Sources" in device settings
4. Tap the APK file to install

## Publishing to Google Play

1. **Create Google Play Developer Account** ($25 one-time fee)
2. **Sign your app**:
   - In Android Studio: Build → Generate Signed Bundle / APK
   - Create a keystore (save it securely!)
3. **Build release AAB**:
   - Build → Build Bundle(s) / APK(s) → Build Bundle(s)
   - Select "release" variant
4. **Upload to Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - Upload the AAB file
   - Fill in store listing, screenshots, etc.
   - Submit for review

## Updating Your App

After making changes to your website:

1. **Deploy your website** (if using production server)
2. **Sync Capacitor** (if config changed):
   ```bash
   npm run cap:sync
   ```
3. **Rebuild in Android Studio**:
   - Build → Rebuild Project
   - Or Build → Build Bundle(s) / APK(s)

## Troubleshooting

### "App not loading"
- Check that `venaverse.net` is accessible
- Verify the URL in `capacitor.config.ts`
- Check Android device's internet connection

### "Build failed"
- Make sure Android Studio is updated
- Check that Java JDK is installed
- Try: File → Invalidate Caches / Restart

### "App crashes on launch"
- Check Android Studio Logcat for errors
- Verify server URL is correct
- Make sure website is deployed and accessible

## Next Steps

1. ✅ Test the app on a device
2. ⚠️ Customize app icon and splash screen
3. ⚠️ Add app permissions if needed
4. ⚠️ Prepare for Play Store submission

## Useful Commands

```bash
# Sync Capacitor
npm run cap:sync

# Open Android Studio
npm run cap:open

# Build and sync
npm run cap:build
```

## App Icon & Splash Screen

To customize:
1. Replace icons in `android/app/src/main/res/` folders
2. Update splash screen in `android/app/src/main/res/values/styles.xml`
3. Run `npm run cap:sync` after changes

---

Your Android app is ready! Open Android Studio and start building! 🚀

