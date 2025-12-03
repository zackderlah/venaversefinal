# Quick Start - Building Your Android App

## Step 1: Open Your Project in Android Studio

1. In Android Studio, click **"Open"** (or File → Open)
2. Navigate to: `C:\Users\ADMIN\Documents\johnnywebsite\android`
3. Select the `android` folder
4. Click **"OK"**

Android Studio will:
- Index the project (may take a minute)
- Download Gradle dependencies (first time only)
- Sync the project

## Step 2: Wait for Project Sync

- Look at the bottom right corner for "Gradle Sync" progress
- Wait for it to complete (first time can take 5-10 minutes)
- If you see errors, wait for sync to finish first

## Step 3: Build Your APK

### For Testing (Debug APK):

1. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. You'll see a notification: "APK(s) generated successfully"
4. Click **"locate"** in the notification
5. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Install on Your Phone:

**Option A: USB Debugging**
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect phone via USB
4. In Android Studio, select your device from the device dropdown (top toolbar)
5. Click the green **Run** button (▶️)

**Option B: Transfer APK**
1. Copy `app-debug.apk` to your phone
2. On your phone: Settings → Security → Enable "Install from Unknown Sources"
3. Tap the APK file to install

## Step 4: Test Your App

- The app will load your website from `https://venaverse.net`
- All features should work as they do in the browser
- Test login, reviews, etc.

## Troubleshooting

### "Gradle sync failed"
- Wait for sync to complete
- Try: File → Invalidate Caches / Restart
- Check internet connection (Gradle downloads dependencies)

### "SDK not found"
- Go to: Tools → SDK Manager
- Install Android SDK Platform (latest version)
- Click "Apply"

### "Build failed"
- Check the "Build" tab at the bottom for errors
- Make sure all dependencies downloaded
- Try: Build → Clean Project, then Build → Rebuild Project

### App doesn't load website
- Check `capacitor.config.ts` - server URL should be `https://venaverse.net`
- Make sure your phone has internet connection
- Check Android Studio Logcat for errors

## Next Steps After First Build

1. ✅ Test the app on your device
2. ⚠️ Customize app icon (replace in `android/app/src/main/res/`)
3. ⚠️ Build release version for Play Store
4. ⚠️ Sign the app for distribution

---

**You're ready to build!** Open the `android` folder in Android Studio and follow the steps above! 🚀

