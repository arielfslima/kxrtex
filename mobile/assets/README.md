# KXRTEX Mobile - Assets Guide

This folder contains the app icons and splash screen for the KXRTEX mobile application.

## Required Assets

To complete the app setup, you need to add the following image files to this folder:

### 1. **icon.png**
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Main app icon for iOS and Android
- **Design**: Should feature the KXRTEX logo with dark background (#0D0D0D) and red accent (#8B0000)

### 2. **splash.png**
- **Size**: 1284x2778 pixels (iPhone 14 Pro Max resolution)
- **Format**: PNG
- **Purpose**: App loading screen
- **Background**: #0D0D0D (dark)
- **Design**: KXRTEX logo centered with tagline "Underground Booking Platform"

### 3. **adaptive-icon.png** (Android)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Android adaptive icon (foreground layer)
- **Design**: Icon should be centered with safe area (inner 66% circle)

### 4. **favicon.png** (Web)
- **Size**: 48x48 pixels
- **Format**: PNG
- **Purpose**: Web favicon
- **Design**: Simplified KXRTEX logo

## How to Generate Icons

### Option 1: Using Figma/Canva (Recommended)
1. Create a 1024x1024 canvas
2. Design the KXRTEX logo with:
   - Background: #0D0D0D (dark)
   - Primary color: #8B0000 (dark red)
   - Accent: #FF4444 (bright red)
3. Export as PNG with high quality

### Option 2: Using AI Tools
Use services like:
- **Midjourney/DALL-E**: Generate underground music-themed icon
- **Logo.com**: AI logo generator
- **Canva**: Template-based logo maker

### Option 3: Using Expo's Icon Generator
```bash
npx expo-generate-icons
```

## Design Guidelines

### Brand Colors
- **Background**: #0D0D0D (almost black)
- **Primary**: #8B0000 (dark red/maroon)
- **Accent**: #FF4444 (bright red)
- **Text**: #FFFFFF (white)

### Theme
- Underground music/DJ culture
- Modern and edgy
- Professional yet rebellious
- Dark theme with vibrant accents

### Icon Suggestions
- Vinyl record with KXRTEX text
- Microphone with red accent
- DJ turntable stylized
- Musical note with underground aesthetic
- Abstract K logo with vibrant red

## Temporary Placeholders

Until custom assets are created, you can use these solid color placeholders:

### Generate Placeholders with Python:
```python
from PIL import Image, ImageDraw, ImageFont

# Icon
icon = Image.new('RGB', (1024, 1024), '#0D0D0D')
draw = ImageDraw.Draw(icon)
draw.ellipse([212, 212, 812, 812], fill='#8B0000')
draw.text((512, 512), 'K', fill='#FFFFFF', anchor='mm', font=ImageFont.truetype('arial.ttf', 400))
icon.save('icon.png')

# Splash
splash = Image.new('RGB', (1284, 2778), '#0D0D0D')
draw = ImageDraw.Draw(splash)
draw.text((642, 1389), 'KXRTEX', fill='#8B0000', anchor='mm', font=ImageFont.truetype('arial.ttf', 120))
splash.save('splash.png')
```

## After Adding Assets

Once you've added the icon and splash files:

1. **Verify files exist**:
   ```bash
   ls mobile/assets/
   ```

2. **Test on device**:
   ```bash
   cd mobile
   npx expo start
   ```

3. **Build for production** (when ready):
   ```bash
   cd mobile
   npx expo prebuild
   npx expo run:android
   # or
   npx expo run:ios
   ```

## EAS Build (Production)

For production builds with custom icons:

```bash
cd mobile
eas build --platform android
eas build --platform ios
```

The EAS Build service will automatically generate all required icon sizes from your 1024x1024 source icon.

---

**Note**: The app will work without custom icons (Expo uses default icons), but custom branding significantly improves the user experience and App Store presentation.

**Priority**: Medium - Can be added later, but should be done before production release.
