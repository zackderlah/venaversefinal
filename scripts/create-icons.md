# Creating PWA Icons

You have two options:

## Option 1: Use Online Tools (Easiest)

1. Go to https://realfavicongenerator.net/
2. Upload your favicon image
3. Configure settings:
   - Android Chrome: 192x192 and 512x512
   - iOS: 192x192
4. Download the generated files
5. Copy `android-chrome-192x192.png` → rename to `icon-192x192.png`
6. Copy `android-chrome-512x512.png` → rename to `icon-512x512.png`
7. Place both in the `public/` folder

## Option 2: Manual Resize

If you have image editing software:

1. Open your favicon image
2. Resize to 192x192 pixels, save as `public/icon-192x192.png`
3. Resize to 512x512 pixels, save as `public/icon-512x512.png`

## Option 3: Use girl2.png

If you want to use the existing `girl2.png`:

1. Resize `girl2.png` to 192x192 → save as `icon-192x192.png`
2. Resize `girl2.png` to 512x512 → save as `icon-512x512.png`

## Quick Test

After adding the icons, test with:
- Chrome DevTools → Application → Manifest
- Or visit your site on mobile and try "Add to Home Screen"

