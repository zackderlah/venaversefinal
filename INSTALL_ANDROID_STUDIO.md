# Installing Android Studio for Windows

## Step 1: Download Android Studio

1. Go to: https://developer.android.com/studio
2. Click **"Download Android Studio"**
3. Accept the terms and download the installer

## Step 2: Install Android Studio

1. **Run the installer** (`android-studio-*.exe`)
2. **Follow the installation wizard**:
   - Click "Next" through the setup
   - Choose installation location (default is fine)
   - Select components:
     - ✅ Android Studio
     - ✅ Android SDK
     - ✅ Android SDK Platform
     - ✅ Android Virtual Device (optional, for emulator)
   - Click "Install"
   - Wait for installation to complete

## Step 3: First Launch Setup

1. **Launch Android Studio** from Start Menu
2. **Setup Wizard** will appear:
   - Choose "Standard" installation
   - Accept license agreements
   - Click "Finish"
   - Wait for SDK components to download (this may take a while)

## Step 4: Install Required SDK Components

1. In Android Studio, go to **Tools → SDK Manager**
2. **SDK Platforms** tab:
   - Check ✅ **Android 13.0 (Tiramisu)** or latest
   - Check ✅ **Android 12.0 (S)** (recommended minimum)
3. **SDK Tools** tab:
   - Check ✅ **Android SDK Build-Tools**
   - Check ✅ **Android SDK Command-line Tools**
   - Check ✅ **Android SDK Platform-Tools**
   - Check ✅ **Google Play services**
4. Click **"Apply"** and wait for downloads

## Step 5: Verify Installation

1. Open a new terminal/PowerShell
2. Check if `adb` is available:
   ```bash
   adb version
   ```
3. If it works, Android Studio is properly installed!

## Step 6: Open Your Android Project

After Android Studio is installed:

```bash
cd C:\Users\ADMIN\Documents\johnnywebsite
npm run cap:open
```

Or manually:
1. Open Android Studio
2. Click "Open"
3. Navigate to: `C:\Users\ADMIN\Documents\johnnywebsite\android`
4. Click "OK"

## Alternative: Build from Command Line (No Android Studio)

If you prefer not to install Android Studio, you can build using Gradle directly:

### Prerequisites:
- Java JDK 11 or higher
- Android SDK (can download separately)

### Build APK:
```bash
cd android
.\gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 4 GB for Android Studio + 2 GB for Android SDK
- **Java**: JDK 11 or higher (usually included with Android Studio)

## Troubleshooting

### "Java not found"
- Android Studio includes JDK, but if you get this error:
- Download JDK 11+ from: https://adoptium.net/
- Set JAVA_HOME environment variable

### "SDK not found"
- Open Android Studio
- Go to Tools → SDK Manager
- Install Android SDK Platform

### Installation takes too long
- This is normal! First-time setup downloads ~2-3 GB
- Be patient, it only happens once

## Quick Install Checklist

- [ ] Download Android Studio installer
- [ ] Run installer and complete setup
- [ ] Launch Android Studio
- [ ] Complete first-time setup wizard
- [ ] Install Android SDK (Tools → SDK Manager)
- [ ] Verify installation works
- [ ] Open your project: `npm run cap:open`

---

**Estimated Time**: 30-60 minutes (mostly waiting for downloads)

Once installed, you'll be able to build your Android app! 🚀

