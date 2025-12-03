# Testing the App in Android Studio

Yes! You can test your app directly in Android Studio using an Android Virtual Device (AVD) emulator. Here's how:

## 🚀 Quick Start

### Step 1: Open Your Project
1. Open Android Studio
2. If not already open, open your project:
   ```bash
   npx cap open android
   ```
   Or in Android Studio: **File → Open** → Navigate to `android` folder

### Step 2: Set Up an Android Virtual Device (AVD)

1. **Open AVD Manager**:
   - Click the **Device Manager** icon in the toolbar (phone/tablet icon)
   - Or go to **Tools → Device Manager**

2. **Create a Virtual Device**:
   - Click **Create Device** (or **+ Create Virtual Device**)
   - Choose a device definition (e.g., **Pixel 6** or **Pixel 7**)
   - Click **Next**

3. **Select System Image**:
   - Choose a system image (Android version)
   - Recommended: **API 33 (Android 13)** or **API 34 (Android 14)**
   - If you see "Download" next to it, click to download first
   - Click **Next**

4. **Configure AVD**:
   - Name your device (e.g., "Pixel 6 API 33")
   - Review settings (you can change RAM, storage, etc.)
   - Click **Finish**

### Step 3: Run the App

1. **Select Your AVD**:
   - In the device dropdown (top toolbar), select your virtual device
   - Or wait for it to appear when you run

2. **Run the App**:
   - Click the green **Run** button (▶️) in the toolbar
   - Or press **Shift + F10** (Windows/Linux) or **Ctrl + R** (Mac)
   - Or go to **Run → Run 'app'**

3. **Wait for Build**:
   - Android Studio will build the app (first time takes longer)
   - The emulator will start (if not already running)
   - The app will install and launch automatically

## 📱 What to Expect

### First Launch
- The emulator may take 1-2 minutes to boot up (first time)
- Subsequent launches are faster
- The app will load your website from `https://venaverse.net`

### Testing Native Features
You can test all native features in the emulator:

- ✅ **Status Bar**: Check top of screen
- ✅ **Back Button**: Use emulator's back button or keyboard backspace
- ✅ **Share**: Test share button (may use Web Share API in emulator)
- ✅ **Pull-to-Refresh**: Pull down on home page
- ⚠️ **Haptics**: May not work in emulator (device-specific)
- ✅ **Keyboard**: Test input fields
- ✅ **Navigation**: Test all app navigation

## 🎮 Emulator Controls

### Navigation
- **Back Button**: Click back button in emulator toolbar, or press **Backspace**
- **Home Button**: Click home icon, or press **Home** key
- **Recent Apps**: Click square icon, or press **Ctrl + H**

### Rotate Device
- Click rotate icon in toolbar, or press **Ctrl + F11** / **Ctrl + F12**

### Zoom
- **Zoom In**: **Ctrl + Plus**
- **Zoom Out**: **Ctrl + Minus**

### Screenshot
- Click camera icon in toolbar, or press **Ctrl + S**

## 🔧 Troubleshooting

### Emulator Won't Start
- **Check HAXM/Virtualization**: Ensure virtualization is enabled in BIOS
- **Check RAM**: Ensure you have enough RAM (4GB+ recommended)
- **Try Different System Image**: Use a lower API level (e.g., API 30)

### App Shows Black Screen
- **Check Network**: Emulator needs internet to load `https://venaverse.net`
- **Check Logcat**: View → Tool Windows → Logcat for errors
- **Restart Emulator**: Close and restart the emulator

### App Crashes
- **Check Logcat**: Look for error messages
- **Clear App Data**: Settings → Apps → venaverse → Clear Data
- **Rebuild**: Build → Clean Project, then Build → Rebuild Project

### Slow Performance
- **Reduce RAM**: Edit AVD → Advanced Settings → Reduce RAM
- **Use x86/x86_64**: Prefer x86 images over ARM (faster on Intel/AMD)
- **Close Other Apps**: Free up system resources

## 🆚 Emulator vs Real Device

### Emulator Advantages
- ✅ No physical device needed
- ✅ Easy to test different screen sizes
- ✅ Easy to take screenshots
- ✅ Can simulate different Android versions
- ✅ Faster iteration (no USB connection)

### Real Device Advantages
- ✅ Better performance
- ✅ Real haptic feedback
- ✅ Real camera/sensors
- ✅ More accurate testing
- ✅ Better for final testing

## 💡 Tips

1. **Keep Emulator Running**: Don't close it between tests (saves time)
2. **Use Snapshots**: Create snapshots for quick restore
3. **Test Different Devices**: Create multiple AVDs for different screen sizes
4. **Check Logcat**: Always check Logcat for debugging info
5. **Hot Reload**: Changes to web code require rebuild, but native changes need full rebuild

## 🔄 Updating the App

When you make changes:

1. **Web Changes** (Next.js):
   ```bash
   npm run build
   npx cap sync android
   ```
   Then rebuild in Android Studio

2. **Native Changes** (Android):
   - Make changes in Android Studio
   - Click Run again

3. **Capacitor Config Changes**:
   ```bash
   npx cap sync android
   ```
   Then rebuild in Android Studio

## 📊 Performance Tips

- **Cold Boot**: First launch is slow (30-60 seconds)
- **Warm Boot**: Subsequent launches are faster (10-20 seconds)
- **Keep Running**: Don't close emulator between tests
- **Allocate Resources**: Give emulator enough RAM (2-4GB recommended)

## ✅ Quick Test Checklist

- [ ] Emulator starts successfully
- [ ] App installs and launches
- [ ] Website loads correctly
- [ ] Navigation works (back button, links)
- [ ] Status bar styling is correct
- [ ] Share button works
- [ ] Pull-to-refresh works
- [ ] Keyboard appears correctly
- [ ] No crashes or errors

Happy testing! 🎉

