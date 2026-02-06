
# Production Deployment Guide

## 🎯 Overview

This guide covers deploying FCP Memorials to production, including:
- Backend deployment verification
- iOS App Store submission
- Android Play Store submission
- Apple Sign-In production configuration
- Universal link verification

## 📋 Pre-Deployment Checklist

### Backend
- [ ] Backend build completed successfully
- [ ] Production API URL is accessible: `https://prod-proj-rgxbjx4svmezrpmh5gdat-liwg5h36mq-ey.a.run.app`
- [ ] Database migrations applied
- [ ] Apple OAuth credentials configured
- [ ] Email notifications working
- [ ] File upload endpoint working

### Frontend
- [ ] All features tested in development
- [ ] Login persistence working
- [ ] Apple Sign-In working (sandbox)
- [ ] QR code scanning working
- [ ] Memorial submission working
- [ ] Media upload working
- [ ] No console errors

### Apple Developer
- [ ] Bundle ID created: `com.fcpmemorials.app`
- [ ] Sign In with Apple enabled
- [ ] Associated domains configured
- [ ] Service ID created and configured
- [ ] Key created and .p8 file downloaded
- [ ] App Store Connect app created

### Google Play
- [ ] Package name created: `com.fcpmemorials.app`
- [ ] App created in Play Console
- [ ] SHA-256 certificate fingerprints added
- [ ] Deep link verification configured

## 🔧 Backend Deployment

### 1. Verify Backend Status

```bash
# Check if backend is accessible
curl https://prod-proj-rgxbjx4svmezrpmh5gdat-liwg5h36mq-ey.a.run.app/api/health

# Check OpenAPI spec
curl https://prod-proj-rgxbjx4svmezrpmh5gdat-liwg5h36mq-ey.a.run.app/openapi.yaml
```

### 2. Test Authentication Endpoints

```bash
# Test email sign-up
curl -X POST https://prod-proj-rgxbjx4svmezrpmh5gdat-liwg5h36mq-ey.a.run.app/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'

# Test email sign-in
curl -X POST https://prod-proj-rgxbjx4svmezrpmh5gdat-liwg5h36mq-ey.a.run.app/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 3. Verify Database

- Check that all tables exist
- Verify migrations applied
- Test CRUD operations

## 🍎 iOS Deployment

### 1. Configure Apple Developer Account

#### App ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to Certificates, Identifiers & Profiles
3. Create App ID:
   - Description: FCP Memorials
   - Bundle ID: `com.fcpmemorials.app`
   - Capabilities: Enable "Sign In with Apple"

#### Associated Domains
1. In App ID configuration, enable "Associated Domains"
2. Add domains:
   - `applinks:fcpmemorials.com`
   - `applinks:prod-proj-rgxbjx4svmezrpmh5gdat-liwg5h36mq-ey.a.run.app`

#### Service ID (for Apple Sign-In)
1. Create Service ID:
   - Description: FCP Memorials Web Service
   - Identifier: `com.fcpmemorials.app.service`
2. Configure Sign In with Apple:
   - Primary App ID: `com.fcpmemorials.app`
   - Return URLs:
     - `https://fcpmemorials.com/auth/callback`
     - `https://prod-proj-rgxbjx4svmezrpmh5gdat-liwg5h36mq-ey.a.run.app/api/auth/oauth-callback/apple`

#### Key for Apple Sign-In
1. Create new Key:
   - Name: FCP Memorials Apple Sign-In Key
   - Enable: Sign In with Apple
2. Download .p8 file (SAVE THIS - you can't download it again)
3. Note the Key ID (e.g., `ABC123XYZ`)
4. Note your Team ID (found in top right of developer portal)

### 2. Configure Backend with Apple Credentials

The backend needs these environment variables:
```
APPLE_CLIENT_ID=com.fcpmemorials.app
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY=<contents of .p8 file>
```

### 3. Build iOS App

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Build for iOS
eas build --platform ios --profile production
```

### 4. Submit to App Store

```bash
# Submit to App Store Connect
eas submit --platform ios

# Or manually:
# 1. Download .ipa from EAS Build
# 2. Upload to App Store Connect via Transporter app
# 3. Fill in app metadata
# 4. Submit for review
```

### 5. Test Apple Sign-In in Production

1. Download app from TestFlight
2. Tap "Continue with Apple"
3. Complete authentication
4. Verify redirect back to app
5. Verify user is logged in
6. Close and reopen app
7. Verify user is still logged in

## 🤖 Android Deployment

### 1. Configure Google Play Console

1. Create app in [Google Play Console](https://play.google.com/console)
2. Set package name: `com.fcpmemorials.app`
3. Fill in app details, screenshots, etc.

### 2. Configure Deep Links

1. In Play Console, go to App Content > Deep Links
2. Add deep links:
   - `https://fcpmemorials.com/go`
   - `https://fcpmemorials.com/memorial/*`
3. Upload `assetlinks.json` to your domain:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.fcpmemorials.app",
       "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
     }
   }]
   ```

### 3. Build Android App

```bash
# Build for Android
eas build --platform android --profile production

# Get SHA-256 fingerprint
keytool -list -v -keystore path/to/keystore.jks
```

### 4. Submit to Play Store

```bash
# Submit to Play Store
eas submit --platform android

# Or manually:
# 1. Download .aab from EAS Build
# 2. Upload to Play Console
# 3. Fill in release notes
# 4. Submit for review
```

## 🔗 Universal Link Verification

### iOS (apple-app-site-association)

1. Create file at `https://fcpmemorials.com/.well-known/apple-app-site-association`:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.fcpmemorials.app",
        "paths": ["/go", "/memorial/*"]
      }
    ]
  }
}
```

2. Verify file is accessible:
```bash
curl https://fcpmemorials.com/.well-known/apple-app-site-association
```

### Android (assetlinks.json)

1. Create file at `https://fcpmemorials.com/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.fcpmemorials.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

2. Verify file is accessible:
```bash
curl https://fcpmemorials.com/.well-known/assetlinks.json
```

## ✅ Post-Deployment Verification

### 1. Test Authentication
- [ ] Email sign-up works
- [ ] Email sign-in works
- [ ] Apple Sign-In works (iOS)
- [ ] Google Sign-In works
- [ ] Token persistence works
- [ ] Sign out works

### 2. Test Memorial Features
- [ ] View memorial works
- [ ] Submit memorial request works
- [ ] Upload photos works
- [ ] Upload videos works
- [ ] Email notification sent
- [ ] QR code generated

### 3. Test QR Code Scanning
- [ ] Scan QR code
- [ ] Opens correct memorial
- [ ] Works without login

### 4. Test Deep Links
- [ ] Universal link opens app (iOS)
- [ ] App link opens app (Android)
- [ ] Fallback to web works

### 5. Test Admin Features
- [ ] View requests works
- [ ] Update request status works
- [ ] Generate QR code works
- [ ] Share QR code works

## 🐛 Troubleshooting

### Apple Sign-In Not Working
1. Check backend logs for detailed error
2. Verify Bundle ID matches everywhere
3. Verify Service ID return URLs are correct
4. Verify Key ID and Team ID are correct
5. Verify .p8 private key is correct
6. Test in sandbox mode first

### Universal Links Not Working
1. Verify `apple-app-site-association` file is accessible
2. Verify file has correct content-type: `application/json`
3. Verify file has no `.json` extension
4. Verify Team ID is correct
5. Verify paths match your routes
6. Uninstall and reinstall app
7. Wait 24 hours for Apple CDN to update

### App Links Not Working (Android)
1. Verify `assetlinks.json` file is accessible
2. Verify SHA-256 fingerprint is correct
3. Verify package name matches
4. Test with `adb shell am start -a android.intent.action.VIEW -d "https://fcpmemorials.com/go?m=test"`

### Backend Not Accessible
1. Check backend logs
2. Verify production URL is correct
3. Check for CORS issues
4. Verify SSL certificate is valid

## 📞 Support

If you encounter issues during deployment:
1. Check backend logs: `get_backend_logs`
2. Check frontend logs: `read_frontend_logs`
3. Review this guide for missed steps
4. Contact support with specific error messages

## 🎉 Success!

Once all verification steps pass, your app is successfully deployed to production!

Users can now:
- Download the app from App Store / Play Store
- Sign in with email or Apple
- Submit memorial requests
- Scan QR codes at memorial sites
- View memorials on the web or in the app
