# 📱 Mobile App Deployment Guide

## 🚀 Deploy to Play Store & App Store

This guide will help you deploy your ExpenseVoice app to both Google Play Store and Apple App Store using Capacitor.

## 📋 Prerequisites

### For Android (Play Store):
- **Android Studio** installed
- **Java Development Kit (JDK) 11+**
- **Google Play Console** account ($25 one-time fee)
- **Android SDK** and build tools

### For iOS (App Store):
- **macOS** computer
- **Xcode 14+** installed
- **Apple Developer Account** ($99/year)
- **iOS device** for testing

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Web App
```bash
npm run build
```

### 3. Initialize Capacitor Platforms
```bash
# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios
```

### 4. Sync Web Assets
```bash
npm run build:mobile
```

## 📱 Android Deployment

### Step 1: Configure Android
1. Open `android/app/src/main/AndroidManifest.xml`
2. Update permissions as needed:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Step 2: Generate Signing Key
```bash
# Generate keystore
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Move to android/app/
mv my-release-key.keystore android/app/
```

### Step 3: Configure Gradle
Create `android/app/keystore.properties`:
```properties
storeFile=my-release-key.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=my-key-alias
keyPassword=YOUR_KEY_PASSWORD
```

### Step 4: Build Release APK
```bash
npm run android:build
```

### Step 5: Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload APK from `android/app/build/outputs/apk/release/`
4. Fill out store listing, content rating, pricing
5. Submit for review

## 🍎 iOS Deployment

### Step 1: Open in Xcode
```bash
npx cap open ios
```

### Step 2: Configure App Settings
1. Set **Bundle Identifier**: `com.expensevoice.app`
2. Set **Team** (your Apple Developer account)
3. Configure **App Icons** and **Launch Screen**

### Step 3: Configure Permissions
Add to `ios/App/App/Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record voice expenses</string>
<key>NSCameraUsageDescription</key>
<string>This app needs camera access for receipt scanning</string>
```

### Step 4: Build for Release
1. Select **Any iOS Device** as target
2. Go to **Product** → **Archive**
3. Once archived, click **Distribute App**
4. Choose **App Store Connect**

### Step 5: Upload to App Store
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Upload build from Xcode
4. Fill out app information, screenshots, description
5. Submit for review

## 🎨 App Store Assets

### Required Screenshots:
- **iPhone 6.7"**: 1290 x 2796 pixels
- **iPhone 6.5"**: 1242 x 2688 pixels  
- **iPhone 5.5"**: 1242 x 2208 pixels
- **iPad Pro 12.9"**: 2048 x 2732 pixels

### App Icons:
- **iOS**: 1024x1024 pixels (App Store)
- **Android**: 512x512 pixels (Play Store)

## 🔧 Build Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run android            # Run on Android device/emulator
npm run ios               # Run on iOS device/simulator

# Production
npm run build:mobile      # Build and sync to mobile
npm run android:build     # Build Android APK
npm run ios:build         # Build iOS app
```

## 📝 App Store Listing

### App Name
**ExpenseVoice - Voice Expense Tracker**

### Description
Transform how you track expenses with the power of your voice! ExpenseVoice uses AI to automatically categorize and organize your spending through simple voice commands.

**Key Features:**
✅ Voice-powered expense recording
✅ AI-powered categorization  
✅ Beautiful analytics and reports
✅ Secure cloud sync with Supabase
✅ Dark mode support
✅ Offline functionality
✅ Real-time expense tracking

Perfect for busy professionals, small business owners, and anyone who wants to effortlessly track their spending without typing.

### Keywords
expense tracker, voice recording, AI categorization, budget, finance, spending, money management

### Category
**Finance**

## 🚨 Important Notes

1. **App Store Review**: Both stores review apps (1-7 days typically)
2. **Permissions**: Clearly explain why you need microphone/camera access
3. **Privacy Policy**: Required for both stores - create one at your website
4. **Testing**: Test thoroughly on real devices before submission
5. **Updates**: Use `npx cap sync` after each web app update

## 🎯 Next Steps After Deployment

1. **Monitor Reviews**: Respond to user feedback
2. **Analytics**: Integrate Firebase/Google Analytics
3. **Crash Reporting**: Add Sentry or similar
4. **Push Notifications**: Implement for engagement
5. **A/B Testing**: Optimize user experience

Your app is now ready for mobile deployment! 🚀