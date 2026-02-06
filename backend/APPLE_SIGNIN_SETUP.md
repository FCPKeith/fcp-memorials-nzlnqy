# Apple Sign-In OAuth Setup Guide

This guide explains how to configure and fix Apple Sign-In OAuth for the Float in Coffin memorials app.

## Overview

The app now uses **Better Auth** for OAuth handling. Better Auth automatically manages:
- OAuth token exchange
- Session creation
- Error handling
- Redirect flow management
- Deep linking support for mobile apps (Expo)

## Environment Variables Required

Set these environment variables for Apple Sign-In to work:

```env
# Apple OAuth Configuration
APPLE_CLIENT_ID=com.fcpmemorials.app                    # Your app's Bundle ID
APPLE_TEAM_ID=YOUR_TEAM_ID                             # Apple Developer Team ID
APPLE_KEY_ID=YOUR_KEY_ID                               # Key ID from your .p8 file
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."   # Contents of your .p8 file
```

## Step 1: Get Apple Credentials

1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Select **Certificates, Identifiers & Profiles**
3. Create or select your App ID: `com.fcpmemorials.app`
4. Enable **Sign in with Apple** capability
5. Under **Keys**, create a new key with **Sign in with Apple** enabled
6. Download the `.p8` file (you can only download once!)
7. Copy the Key ID from the key details page
8. Find your Team ID in the top right of Developer Console

## Step 2: Set Environment Variables

Store the `.p8` file contents as a multi-line environment variable:

```bash
# On macOS/Linux
export APPLE_PRIVATE_KEY="$(cat ~/Downloads/AuthKey_ABC123XYZ.p8)"

# Or set it in your .env file
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
...
-----END PRIVATE KEY-----"
```

## Step 3: Configure Redirect URI

Add this redirect URI to your Apple app configuration:

```
https://pwesm38m2s562pv8mecxsgwjqsk4267e.app.specular.dev/api/auth/oauth-callback/apple
```

This is where Apple will send the OAuth callback after user authorization.

## Supported OAuth Flows

### Web OAuth Flow (Browser)
```
1. User clicks "Sign in with Apple" button
2. Browser redirects to Apple login
3. Apple redirects back to callback URL with authorization code
4. Better Auth exchanges code for tokens
5. User session created, redirects to redirect_to URL
```

### Mobile (Expo) Deep Link Flow
```
1. User taps "Sign in with Apple" in Expo app
2. Apple redirects to deep link: exp://ft6gors-anonymous-8081.exp.direct/--/admin?code=...&expo_client=true
3. Expo app receives deep link and sends to API: /api/auth/oauth-callback/apple?redirect_to=exp://...&code=...
4. Better Auth creates session
5. Mobile app redirects to the memorial or admin page
```

## Testing the OAuth Flow

### 1. Test OAuth Status
```bash
curl https://your-api-url/api/oauth/status
```

Expected response:
```json
{
  "status": "ok",
  "environment": "production",
  "appleOAuthConfigured": true,
  "trustedOrigins": [...]
}
```

### 2. Test Debug Callback
Use this URL to test the callback flow:
```
https://your-api-url/api/oauth/apple/callback-debug?code=ABC123&state=XYZ789&redirect_to=https://fcpmemorials.com/admin
```

### 3. Test from CLI (Manual Token Exchange)
```bash
curl -X POST https://your-api-url/api/auth/sign-in/social \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "apple",
    "code": "YOUR_AUTH_CODE",
    "callbackURL": "https://your-api-url/api/auth/oauth-callback/apple"
  }'
```

## Debugging Guide

### Common Issues & Solutions

#### 1. "invalid_request" Error
**Cause**: Missing or invalid parameters
**Fix**: Verify in `/api/oauth/apple/callback-debug`:
- Authorization code is present
- State parameter matches (if applicable)
- Redirect URI matches configured value

#### 2. "invalid_client" Error
**Cause**: Wrong Bundle ID or Team ID
**Fix**: Check environment variables match Apple Developer Console:
```bash
echo $APPLE_CLIENT_ID  # Should be: com.fcpmemorials.app
echo $APPLE_TEAM_ID    # Should match your Developer Team ID
```

#### 3. "invalid_grant" Error
**Cause**: Authorization code expired or already used
**Fix**:
- Authorization codes expire after 5 minutes
- Each code can only be used once
- Try again with a fresh authorization code

#### 4. Session Not Created
**Cause**: Token exchange succeeded but session creation failed
**Check logs**: Look for database errors
**Fix**: Ensure auth tables are migrated:
```bash
npm run db:migrate
```

#### 5. Deep Link Not Working (Expo)
**Cause**: Deep link redirect not configured properly
**Fix**: Ensure callback includes:
```
?redirect_to=exp://YOUR_EXPO_URL/--/path&expo_client=true
```

### Viewing Debug Information

All OAuth flow steps are logged. Access logs via:

```bash
# Development: Check console output
npm run dev

# Production: Check application logs
# Logs include: code receipt, token exchange, session creation, redirects
```

Debug endpoint at `/api/oauth/apple/callback-debug` provides detailed info:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "hasCode": true,
  "hasError": false,
  "redirectTo": "https://fcpmemorials.com/admin",
  "isExpoClient": false,
  "allParams": { ... }
}
```

## Database Migrations

Better Auth requires its own tables. Run migrations:

```bash
npm run db:migrate
```

This creates tables for:
- `user` - User accounts
- `session` - User sessions
- `account` - Linked OAuth accounts (Apple, Google, etc.)
- `verification` - Email verification tokens

## Architecture

Better Auth handles all OAuth complexity:

```
User → Apple Login → Apple Authorization → Callback URL
                         ↓
                    Better Auth OAuth Handler
                         ↓
                    Exchange Code for Tokens
                         ↓
                    Create/Link User Account
                         ↓
                    Create Session
                         ↓
                    Redirect to App
```

**Custom Code**: Minimal needed. All handled by Better Auth.
**Error Handling**: Built-in. Better Auth returns detailed errors.
**Logging**: Comprehensive via app.logger

## Supported Platforms

✅ **Web Browser**: Standard OAuth flow
✅ **iOS App (native)**: Deep linking + OAuth
✅ **Android App (native)**: Deep linking + OAuth
✅ **Expo**: Deep linking with expo_client parameter
✅ **Sandbox**: Same configuration works in Apple's sandbox

## Security Features

- ✅ State parameter validation (CSRF protection)
- ✅ Authorization code expires after 5 minutes
- ✅ Each code can only be used once
- ✅ Secure session creation with HTTP-only cookies
- ✅ PKCE support for native apps
- ✅ Trusted origins configuration

## Production Checklist

Before going live:

- [ ] Set all Apple credentials in environment variables
- [ ] Add production redirect URI to Apple configuration
- [ ] Run database migrations
- [ ] Test OAuth flow end-to-end
- [ ] Enable HTTPS for production URL
- [ ] Set appropriate cookie security flags
- [ ] Monitor OAuth logs for errors
- [ ] Test on real iOS/Android devices

## Support Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/ok` | GET | Better Auth health check |
| `/api/oauth/status` | GET | OAuth configuration status |
| `/api/oauth/apple/callback-debug` | GET | Debug OAuth callback |
| `/api/oauth/validate-token` | POST | Validate tokens |
| `/api/auth/reference` | GET | Interactive API docs |
| `/api/auth/open-api/generate-schema` | GET | OpenAPI schema |

## Next Steps

1. ✅ Set environment variables
2. ✅ Run database migrations
3. ✅ Test with `/api/oauth/status`
4. ✅ Implement Apple Sign-In button in your app
5. ✅ Test full OAuth flow
6. ✅ Monitor logs for any issues

Questions? Check Better Auth docs: https://better-auth.com/docs
