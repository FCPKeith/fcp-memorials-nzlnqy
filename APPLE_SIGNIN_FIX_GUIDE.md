
# 🍎 Apple Sign-In Fix Guide

## Current Status

**Frontend:** ✅ Fully integrated and ready
**Backend:** ⚠️ Needs Apple OAuth configuration

The Apple Sign-In feature is returning "internal_server_error" during the OAuth callback. This is a **backend configuration issue**, not a frontend problem.

## What's Already Working (Frontend)

✅ **Apple Sign-In Button** - Properly configured in `app/auth.tsx`
✅ **OAuth Flow** - Web popup and native deep linking implemented
✅ **Session Management** - Token storage and persistence via SecureStore
✅ **Redirect Handling** - Proper callback URL handling in `app/auth-callback.tsx`
✅ **Deep Linking** - Associated domains configured in `app.json`

## Backend Configuration Required

The backend needs the following Apple OAuth credentials configured:

### 1. Apple Developer Setup

**Bundle ID:** `com.fcpmemorials.app` (already configured in `app.json`)

**Associated Domains:**
- `applinks:fcpmemorials.com`
- `applinks:pwesm38m2s562pv8mecxsgwjqsk4267e.app.specular.dev`

### 2. Apple Sign In Configuration

The backend (using Better Auth) needs these environment variables or configuration:

```typescript
// In backend configuration
apple: {
  clientId: "com.fcpmemorials.app", // Your Bundle ID
  teamId: "YOUR_APPLE_TEAM_ID",     // From Apple Developer
  keyId: "YOUR_KEY_ID",              // From Apple Developer
  privateKey: "YOUR_PRIVATE_KEY",    // .p8 file content
  redirectURI: "https://pwesm38m2s562pv8mecxsgwjqsk4267e.app.specular.dev/api/auth/oauth-callback/apple"
}
```

### 3. How to Get Apple Credentials

**Step 1: Get Team ID**
1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Click on "Membership" in the sidebar
3. Copy your Team ID (10-character string)

**Step 2: Create Sign In with Apple Key**
1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/authkeys/list)
2. Click the "+" button to create a new key
3. Enter a name (e.g., "FCP Memorials Sign In")
4. Check "Sign In with Apple"
5. Click "Configure" and select your App ID
6. Click "Save" and then "Continue"
7. Click "Register"
8. **Download the .p8 file** (you can only download it once!)
9. Copy the Key ID (10-character string)

**Step 3: Configure App ID**
1. Go to [Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Select your App ID (`com.fcpmemorials.app`)
3. Scroll to "Sign In with Apple"
4. Check "Enable as a primary App ID"
5. Click "Save"

**Step 4: Configure Return URLs**
1. In the App ID configuration, click "Edit" next to "Sign In with Apple"
2. Add return URLs:
   - `https://fcpmemorials.com/auth/callback`
   - `https://pwesm38m2s562pv8mecxsgwjqsk4267e.app.specular.dev/api/auth/oauth-callback/apple`
3. Click "Save"

### 4. Backend Implementation

The backend should use Better Auth's Apple provider. Example configuration:

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // ... other config
  socialProviders: {
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "com.fcpmemorials.app",
      teamId: process.env.APPLE_TEAM_ID!,
      keyId: process.env.APPLE_KEY_ID!,
      privateKey: process.env.APPLE_PRIVATE_KEY!,
      redirectURI: `${process.env.BACKEND_URL}/api/auth/oauth-callback/apple`,
    },
  },
});
```

### 5. Environment Variables

Add these to your backend deployment:

```bash
APPLE_CLIENT_ID=com.fcpmemorials.app
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END PRIVATE KEY-----"
```

## Testing Apple Sign-In

Once the backend is configured, test the flow:

### Web Testing
```bash
npm run web
```

1. Click "Continue with Apple"
2. Popup window opens
3. Sign in with Apple ID
4. Popup closes automatically
5. ✅ Redirected to Admin Dashboard

### iOS Testing
```bash
npm run ios
```

1. Tap "Continue with Apple"
2. Apple Sign In sheet appears
3. Sign in with Apple ID or Face ID
4. ✅ Redirected to Admin Dashboard
5. Close and reopen app
6. ✅ Still logged in (session persists)

## Debugging

### Check Backend Logs

Look for these log messages:

```
[Auth] Apple OAuth initiated
[Auth] Apple OAuth callback received
[Auth] Apple token exchange successful
[Auth] User session created
```

### Check Frontend Logs

Look for these log messages:

```
[AuthProvider] Signing in with apple
[AuthProvider] Social sign-in initiated
[AuthProvider] Session found, user: user@example.com
[AuthProvider] User logged in, redirecting to admin dashboard
```

### Common Errors

**Error: "invalid_client"**
- Cause: Client ID doesn't match Bundle ID
- Fix: Ensure `clientId` is exactly `com.fcpmemorials.app`

**Error: "invalid_grant"**
- Cause: Private key is incorrect or expired
- Fix: Re-download the .p8 file and update the private key

**Error: "redirect_uri_mismatch"**
- Cause: Redirect URI not configured in Apple Developer
- Fix: Add the redirect URI to your App ID configuration

**Error: "internal_server_error"**
- Cause: Missing or incorrect credentials
- Fix: Verify all environment variables are set correctly

## Frontend Code Reference

The frontend Apple Sign-In implementation is in:

**Auth Screen:** `app/auth.tsx`
```typescript
const handleSocialAuth = async (provider: "google" | "apple" | "github") => {
  // ...
  if (provider === "apple") {
    await signInWithApple();
  }
  // ...
};
```

**Auth Context:** `contexts/AuthContext.tsx`
```typescript
const signInWithApple = () => signInWithSocial("apple");

const signInWithSocial = async (provider: "google" | "apple" | "github") => {
  if (Platform.OS === "web") {
    const token = await openOAuthPopup(provider);
    await setBearerToken(token);
    await fetchUser();
  } else {
    const callbackURL = Linking.createURL("/(admin)");
    await authClient.signIn.social({
      provider,
      callbackURL,
    });
  }
};
```

**Auth Client:** `lib/auth.ts`
```typescript
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "fcpmemorials",
      storagePrefix: "fcp-memorials",
      storage,
    }),
  ],
});
```

## Summary

**What's Done:**
- ✅ Frontend fully integrated
- ✅ OAuth flow implemented (web + native)
- ✅ Session persistence configured
- ✅ Deep linking configured
- ✅ Associated domains configured

**What's Needed:**
- ⚠️ Backend Apple OAuth configuration
- ⚠️ Apple Developer credentials
- ⚠️ Environment variables

Once the backend is configured with the correct Apple credentials, Apple Sign-In will work seamlessly on both web and iOS.
