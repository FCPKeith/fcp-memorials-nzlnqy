
# Universal QR Code System - FCP Memorials

## Overview

The FCP Memorials app now uses a **universal QR code system** that works internationally on any device. Each memorial has a unique QR code that automatically detects if the app is installed and opens the appropriate version.

## How It Works

### 1. Universal URL Format

Each memorial has a universal landing URL:
```
https://fcpmemorials.com/go?m={memorial-slug}
```

**Example:**
```
https://fcpmemorials.com/go?m=john-doe-1928
```

### 2. Memorial Slug Generation

The memorial slug is automatically generated from:
- Person's name (lowercase, hyphenated)
- Birth year (if available)

**Examples:**
- "John Doe" born 1928 → `john-doe-1928`
- "Mary Smith" born 1945 → `mary-smith-1945`
- "Robert Johnson" (no birth year) → `robert-johnson`

### 3. QR Code Flow

```
User scans QR code
    ↓
Opens: https://fcpmemorials.com/go?m=john-doe-1928
    ↓
    ├─→ App installed? → Opens app at /memorial/john-doe-1928
    └─→ App NOT installed? → Opens web version of memorial
```

### 4. Deep Linking Configuration

The app is configured to handle universal links:

**iOS:**
- Associated domain: `fcpmemorials.com`
- Handles: `/go` and `/memorial` paths

**Android:**
- Intent filters for `https://fcpmemorials.com/go`
- Auto-verify enabled for seamless app opening

**Web:**
- Falls back to web version if app is not installed

## Features

### ✓ International Compatibility
- Works on any device, anywhere in the world
- No region-specific restrictions
- Supports all major platforms (iOS, Android, Web)

### ✓ Automatic App Detection
- If the FCP Memorials app is installed → Opens in app
- If app is NOT installed → Opens in web browser
- No manual selection required

### ✓ Testing Before Publishing
- QR codes are generated immediately upon request submission
- Can be tested before payment
- Can be tested before memorial is published
- Admin dashboard shows QR code for all requests

### ✓ Included Everywhere
- **Admin Dashboard:** Shows universal QR and URL for each request
- **Email Notifications:** Includes QR code image and universal link
- **Memorial Pages:** Displays universal QR for sharing

## Admin Dashboard

When viewing memorial requests, the admin dashboard displays:

1. **Memorial Slug:** The unique identifier (e.g., `john-doe-1928`)
2. **Universal Link:** The full URL (e.g., `https://fcpmemorials.com/go?m=john-doe-1928`)
3. **QR Code Image:** Visual QR code that can be scanned
4. **Share Button:** Quickly share the QR code and link

### Features:
- ✓ Works internationally on any device
- ✓ Auto-detects if app is installed
- ✓ Falls back to web version

## Email Notifications

Every memorial request email sent to `floatincoffin@icloud.com` includes:

```html
<h3>Universal QR Code & Link</h3>
<p><strong>Memorial Slug:</strong> john-doe-1928</p>
<p><strong>Universal Link:</strong> https://fcpmemorials.com/go?m=john-doe-1928</p>
<p><strong>QR Code:</strong> <img src="..." alt="Memorial QR Code" width="200" /></p>
<p><em>Scanning this QR code will open the memorial on any device, with automatic app detection.</em></p>
```

## Scanner Implementation

The QR code scanner in the app handles multiple formats:

1. **Universal format:** `https://fcpmemorials.com/go?m=john-doe-1928`
2. **Direct format:** `https://fcpmemorials.com/memorial/john-doe-1928`
3. **Slug only:** `john-doe-1928`

All formats are automatically detected and routed correctly.

## Technical Details

### Backend Changes

1. **Updated QR Code Generation:**
   - Changed from: `/memorial/{slug}`
   - To: `/go?m={slug}`

2. **New Endpoint:**
   - `GET /api/memorials/resolve/:slug`
   - Returns full memorial data by slug

3. **Email Notification:**
   - Includes universal QR code section
   - Shows memorial slug and universal link

### Frontend Changes

1. **Universal Link Handler:**
   - New page: `app/go.tsx`
   - Extracts memorial slug from URL parameter
   - Redirects to memorial detail page

2. **Scanner Updates:**
   - Detects universal URL format
   - Extracts memorial slug from QR code data
   - Navigates to correct memorial

3. **Admin Dashboard:**
   - Displays universal QR code for each request
   - Shows memorial slug and universal link
   - Includes share functionality

4. **Memorial Detail Page:**
   - Shows universal QR code
   - Displays universal link
   - Explains auto-detection features

### Deep Linking Configuration

**app.json:**
```json
{
  "scheme": "fcpmemorials",
  "intentFilters": [
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        {
          "scheme": "https",
          "host": "fcpmemorials.com",
          "pathPrefix": "/go"
        }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ],
  "associatedDomains": ["applinks:fcpmemorials.com"]
}
```

## Usage Examples

### For Families (Requesting a Memorial)

1. Submit memorial request through the app
2. Receive email with universal QR code
3. QR code can be tested immediately (before payment)
4. Share QR code with family and friends
5. Print QR code for grave marker

### For Visitors (Viewing a Memorial)

1. Scan QR code at grave site
2. Automatically opens memorial:
   - In app (if installed)
   - In web browser (if app not installed)
3. View photos, story, and location
4. Share memorial with others

### For Admins

1. View all memorial requests in dashboard
2. See universal QR code for each request
3. Test QR code before publishing
4. Share QR code with requester
5. Include QR code in email notifications

## Benefits

### 🌍 International
- Works in any country
- No region restrictions
- Supports all languages

### 📱 Cross-Platform
- iOS app
- Android app
- Web browser
- All platforms supported

### 🔗 Smart Linking
- Auto-detects app installation
- Seamless app opening
- Graceful web fallback

### 🧪 Testable
- Test before payment
- Test before publishing
- Verify QR code works correctly

### 📧 Included Everywhere
- Admin dashboard
- Email notifications
- Memorial pages
- Easy sharing

## Future Enhancements

Potential improvements for the universal QR system:

1. **Analytics:** Track QR code scans and app opens
2. **Custom Domains:** Support custom memorial domains
3. **QR Code Styles:** Branded QR codes with logo
4. **Offline Support:** Cache memorial data for offline viewing
5. **Multi-Language:** Detect user language and show appropriate version

## Support

For questions or issues with the universal QR code system:
- Email: floatincoffin@icloud.com
- Check admin dashboard for QR code status
- Test QR codes before printing or sharing
