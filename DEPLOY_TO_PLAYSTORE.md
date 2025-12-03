# Deploying to Google Play Store

This guide walks you through deploying your venaverse Android app to the Google Play Store.

## Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console/signup
   - Complete your developer profile

2. **App Signing Key** (Generate a keystore for signing your app)

## Step 1: Generate a Signing Key

### Option A: Using Android Studio (Recommended)

1. In Android Studio, go to **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle** (recommended) or **APK**
3. Click **Create new...** to create a new keystore
4. Fill in the keystore information:
   - **Key store path**: Choose a secure location (e.g., `android/app/venaverse-release-key.jks`)
   - **Password**: Create a strong password (save this!)
   - **Key alias**: `venaverse-key`
   - **Key password**: Create a strong password (save this!)
   - **Validity**: 25 years (recommended)
   - **Certificate information**: Fill in your details
5. Click **OK** to create the keystore
6. **IMPORTANT**: Save the keystore file and passwords in a secure location. If you lose this, you cannot update your app!

### Option B: Using Command Line

```bash
cd android/app
keytool -genkey -v -keystore venaverse-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias venaverse-key
```

## Step 2: Configure App Signing

1. Create a file `android/key.properties` (add this to `.gitignore`):

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=venaverse-key
storeFile=../app/venaverse-release-key.jks
```

2. Update `android/app/build.gradle` to use the signing config:

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Step 3: Update App Version

1. Update `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.venaverse.app"
        versionCode 1  // Increment this for each release
        versionName "1.0.0"  // User-visible version
        ...
    }
}
```

**Important**: Increment `versionCode` (integer) for each new release. Update `versionName` (string) for user-facing version.

## Step 4: Build Release Bundle

### In Android Studio:

1. Go to **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Select your keystore and enter passwords
4. Choose **release** build variant
5. Click **Finish**
6. The AAB file will be generated at: `android/app/release/app-release.aab`

### Using Command Line:

```bash
cd android
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## Step 5: Prepare App Assets

Before uploading, prepare:

1. **App Icon**: 512x512px PNG (no transparency)
2. **Feature Graphic**: 1024x500px PNG
3. **Screenshots**: 
   - Phone: At least 2, up to 8 (16:9 or 9:16)
   - Tablet: Optional (7" and 10")
4. **App Description**: Up to 4000 characters
5. **Short Description**: Up to 80 characters
6. **Privacy Policy URL**: Required for apps that collect user data

## Step 6: Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - **App name**: venaverse (or your preferred name)
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check all that apply
4. Click **Create app**

## Step 7: Complete Store Listing

1. Go to **Store presence** → **Main store listing**
2. Fill in:
   - **App name**
   - **Short description** (80 chars max)
   - **Full description** (4000 chars max)
   - **App icon** (512x512)
   - **Feature graphic** (1024x500)
   - **Screenshots** (at least 2)
   - **Category**: Entertainment or Social
   - **Contact details**
   - **Privacy policy URL** (required)

## Step 8: Set Up Content Rating

1. Go to **Content rating**
2. Complete the questionnaire about your app's content
3. Submit for rating (usually instant for simple apps)

## Step 9: Set Up Pricing & Distribution

1. Go to **Pricing & distribution**
2. Select **Free**
3. Select countries for distribution
4. Check **Content guidelines** and **Export compliance**
5. Complete **US export laws** declaration if needed

## Step 10: Upload App Bundle

1. Go to **Production** (or **Internal testing** / **Closed testing** for testing first)
2. Click **Create new release**
3. Upload your `app-release.aab` file
4. Fill in **Release notes** (what's new in this version)
5. Click **Review release**

## Step 11: Testing (Recommended Before Production)

### Internal Testing

1. Create an **Internal testing** track
2. Upload your AAB
3. Add testers (up to 100 email addresses)
4. Testers can download from a private link

### Closed Testing

1. Create a **Closed testing** track
2. Upload your AAB
3. Create a test group and add testers
4. Testers join via a Google Group or email list

## Step 12: Review and Publish

1. Review all sections:
   - ✅ Store listing complete
   - ✅ Content rating complete
   - ✅ App bundle uploaded
   - ✅ Pricing & distribution set
   - ✅ All required policies accepted

2. Go to **Production** → **Releases**
3. Click **Review release**
4. Review the summary
5. Click **Start rollout to Production**

## Step 13: App Review

- Google typically reviews apps within 1-7 days
- You'll receive email notifications about the review status
- If rejected, address the issues and resubmit

## Step 14: Monitor After Launch

1. **Dashboard**: Monitor installs, ratings, crashes
2. **User feedback**: Respond to reviews
3. **Analytics**: Track user behavior
4. **Updates**: Release updates through the same process

## Important Notes

### App Signing by Google Play

Google Play can manage your app signing key for you:
- **Recommended**: Let Google Play manage your signing key
- Upload your upload key, Google generates the app signing key
- More secure and easier key management

### Version Updates

For each update:
1. Increment `versionCode` in `build.gradle`
2. Update `versionName` if needed
3. Build new AAB
4. Upload to same or new release track
5. Add release notes

### Common Issues

1. **App not installing**: Check minimum SDK version
2. **Permissions**: Declare all permissions in `AndroidManifest.xml`
3. **Target SDK**: Must target recent Android version (check requirements)
4. **64-bit**: Required for apps targeting Android 9.0+

## Resources

- [Google Play Console](https://play.google.com/console)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [App Signing Best Practices](https://developer.android.com/studio/publish/app-signing)

## Quick Checklist

- [ ] Google Play Developer account created
- [ ] Keystore generated and secured
- [ ] App signed with release key
- [ ] Version code and name set
- [ ] AAB built successfully
- [ ] Store listing completed
- [ ] Screenshots and graphics prepared
- [ ] Privacy policy URL provided
- [ ] Content rating completed
- [ ] App bundle uploaded
- [ ] All policies accepted
- [ ] App submitted for review

Good luck with your Play Store launch! 🚀

