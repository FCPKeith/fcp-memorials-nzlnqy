
# FCP Memorials - Deployment Guide

## 🚀 Deployment Checklist

### 1. Backend Preparation

- [ ] Backend is deployed and accessible
- [ ] Database is set up and seeded with test data
- [ ] Better Auth is configured with OAuth credentials
- [ ] Environment variables are set
- [ ] CORS is configured for frontend domain
- [ ] SSL/HTTPS is enabled
- [ ] API endpoints are tested with Postman/curl

### 2. Frontend Configuration

#### Update Backend URL
```json
// app.json
{
  "expo": {
    "extra": {
      "backendUrl": "https://your-production-backend.com"
    }
  }
}
```

#### Update OAuth Redirect URLs
```typescript
// lib/auth.ts
// Ensure redirect URLs match your production domain
```

#### Update App Metadata
```json
// app.json
{
  "expo": {
    "name": "FCP Memorials",
    "slug": "fcp-memorials",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.fcpmemorials.app"
    },
    "android": {
      "package": "com.fcpmemorials.app"
    }
  }
}
```

### 3. Build Configuration

#### iOS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure iOS build
eas build:configure

# Build for iOS
eas build --platform ios --profile production
```

#### Android Build
```bash
# Build for Android
eas build --platform android --profile production
```

#### Web Build
```bash
# Build for web
npm run build:web

# Deploy to hosting (Vercel, Netlify, etc.)
```

### 4. App Store Submission

#### iOS App Store
- [ ] Create App Store Connect account
- [ ] Create app listing
- [ ] Upload screenshots
- [ ] Write app description
- [ ] Set pricing (free)
- [ ] Submit for review
- [ ] Wait for approval

#### Google Play Store
- [ ] Create Google Play Console account
- [ ] Create app listing
- [ ] Upload screenshots
- [ ] Write app description
- [ ] Set pricing (free)
- [ ] Submit for review
- [ ] Wait for approval

### 5. Web Deployment

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### 6. Post-Deployment Testing

- [ ] Test on production backend
- [ ] Test OAuth flows
- [ ] Test all API endpoints
- [ ] Test on real devices (iOS, Android)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test payment flow (if implemented)
- [ ] Monitor error logs
- [ ] Check analytics

### 7. Monitoring & Analytics

#### Set Up Error Tracking
```bash
# Install Sentry
npm install @sentry/react-native

# Configure Sentry
# Add to app/_layout.tsx
```

#### Set Up Analytics
```bash
# Install Expo Analytics
npm install expo-analytics

# Configure analytics
# Add to app/_layout.tsx
```

### 8. Documentation

- [ ] Update README.md with production URLs
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Create admin guide
- [ ] Document troubleshooting steps

## 🔐 Security Checklist

- [ ] All API calls use HTTPS
- [ ] Bearer tokens stored securely
- [ ] No sensitive data in logs
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on backend
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS prevention

## 📊 Performance Optimization

- [ ] Images optimized and compressed
- [ ] API responses cached where appropriate
- [ ] Lazy loading implemented
- [ ] Bundle size optimized
- [ ] Code splitting implemented
- [ ] Service worker configured (PWA)

## 🐛 Rollback Plan

If deployment fails:

1. **Revert Backend**
   ```bash
   # Rollback to previous version
   git revert HEAD
   git push
   ```

2. **Revert Frontend**
   ```bash
   # Rollback to previous build
   eas build:list
   eas submit --id <previous-build-id>
   ```

3. **Notify Users**
   - Post status update
   - Send email notification
   - Update social media

## 📱 App Store Metadata

### App Name
```
FCP Memorials
```

### Subtitle
```
Stories That Remain
```

### Description
```
FCP Memorials is a digital memorial platform where anyone can scan a QR code at a grave or marker and instantly view a loved one's story.

Features:
• Scan QR codes to view memorials
• Browse memorials on an interactive map
• Request professionally curated memorials
• Share memorial links with family and friends

All memorials are permanent, public, and dignified. Viewing is always free. Payment is required only to request a new memorial.

FCP Memorials is international, inclusive, and accessible on all devices.
```

### Keywords
```
memorial, obituary, tribute, remembrance, cemetery, QR code, legacy, family history, genealogy
```

### Category
```
Lifestyle
```

### Screenshots Required
- [ ] iPhone 6.7" (1290 x 2796)
- [ ] iPhone 6.5" (1242 x 2688)
- [ ] iPhone 5.5" (1242 x 2208)
- [ ] iPad Pro 12.9" (2048 x 2732)
- [ ] Android Phone (1080 x 1920)
- [ ] Android Tablet (1536 x 2048)

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All features tested
- [ ] All bugs fixed
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Legal review completed
- [ ] Privacy policy published
- [ ] Terms of service published

### Launch Day
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Submit to app stores
- [ ] Announce on social media
- [ ] Send email to beta testers
- [ ] Monitor error logs
- [ ] Monitor user feedback

### Post-Launch
- [ ] Monitor analytics
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately
- [ ] Plan next iteration
- [ ] Collect feature requests

## 📞 Support

### User Support
- Email: support@fcpmemorials.com
- Website: https://fcpmemorials.com/support
- FAQ: https://fcpmemorials.com/faq

### Technical Support
- Email: tech@fcpmemorials.com
- Slack: #fcp-memorials-tech
- GitHub Issues: https://github.com/fcpmemorials/app/issues

## 🎉 Success Metrics

Track these metrics post-launch:

- [ ] Number of downloads
- [ ] Daily active users (DAU)
- [ ] Monthly active users (MAU)
- [ ] QR scans per day
- [ ] Memorial requests per day
- [ ] Conversion rate (views → requests)
- [ ] Average session duration
- [ ] User retention rate
- [ ] App store rating
- [ ] User reviews

## 📈 Growth Strategy

### Marketing
- [ ] Social media campaigns
- [ ] Content marketing (blog posts)
- [ ] SEO optimization
- [ ] Partnerships with funeral homes
- [ ] Partnerships with cemeteries
- [ ] Press releases
- [ ] Influencer outreach

### User Acquisition
- [ ] App store optimization (ASO)
- [ ] Paid advertising (Google Ads, Facebook Ads)
- [ ] Referral program
- [ ] Email marketing
- [ ] Community building

---

## 🚀 Ready to Deploy!

Follow this guide step-by-step to ensure a smooth deployment.

**Good luck! 🎉**
