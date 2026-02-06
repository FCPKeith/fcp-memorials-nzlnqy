# Apple Sign-In OAuth Callback Error Troubleshooting

## Issue: "internal_server_error" During OAuth Callback

When scanning the Apple Sign-In QR code or clicking "Sign in with Apple", the callback returns "internal_server_error".

## Root Causes & Solutions

### 1. Missing Authentication Schema

**Error**: Better Auth returns 500 because auth tables don't exist

**Check**:
```bash
# Verify auth schema file exists
ls -la src/db/auth-schema.ts

# Verify drizzle.config.ts includes auth schema
grep "auth-schema.ts" drizzle.config.ts
```

**Fix**:
```bash
# Run database migrations to create auth tables
npm run db:migrate
```

---

### 2. Missing or Incorrect Apple Credentials

**Error**: Token exchange fails with 500 error

**Check**:
```bash
# Verify environment variables are set
echo $APPLE_CLIENT_ID
echo $APPLE_TEAM_ID
echo $APPLE_KEY_ID
echo $APPLE_PRIVATE_KEY | head -c 50

# Test OAuth status endpoint
curl https://your-api-url/api/oauth/status
```

**Fix**:
```bash
# Set environment variables
export APPLE_CLIENT_ID="com.fcpmemorials.app"
export APPLE_TEAM_ID="ABC123XYZ"
export APPLE_KEY_ID="KEY12345"
export APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
-----END PRIVATE KEY-----"

# Verify by checking OAuth status again
curl https://your-api-url/api/oauth/status
```

---

### 3. Invalid Redirect URI

**Error**: Apple rejects the callback URL

**Check**:
```bash
# Test the callback endpoint directly
curl "https://your-api-url/api/auth/oauth-callback/apple?code=TEST&state=TEST"
```

**Fix**:
1. Go to Apple Developer Console
2. Navigate to your app configuration
3. Verify redirect URI exactly matches:
   ```
   https://pwesm38m2s562pv8mecxsgwjqsk4267e.app.specular.dev/api/auth/oauth-callback/apple
   ```
4. Save changes and wait 15 minutes for propagation

---

### 4. Database Connection Issues

**Error**: Cannot create session (database error)

**Check**:
```bash
# Verify database connection
npm run db:push

# Check for migration errors
npm run db:migrate
```

**Fix**:
```bash
# Reset migrations (development only)
npm run db:migrate -- --force

# Check for SQL errors in logs
npm run dev 2>&1 | grep -i "error\|migration"
```

---

### 5. Session Creation Failure

**Error**: OAuth code exchange succeeds, but session creation fails

**Check**:
```bash
# Enable verbose logging
DEBUG=better-auth:* npm run dev

# Look for session creation errors in logs
```

**Fix**:
```bash
# Verify user tables exist
npm run db:check

# Recreate user tables
npm run db:reset  # WARNING: Deletes all data
npm run db:migrate
```

---

### 6. Network/Connectivity Issues

**Error**: Timeout or connection refused during callback

**Check**:
```bash
# Test API connectivity
curl -I https://your-api-url/api/oauth/status

# Check for CORS issues
curl -H "Origin: exp://localhost" -v https://your-api-url/api/oauth/status
```

**Fix**:
```bash
# Verify trusted origins configuration
# In src/index.ts, check trustedOrigins array includes:
# - "exp://**" for Expo
# - "https://fcpmemorials.com" for web
# - "http://localhost:8081" for local testing

# Restart server to apply changes
npm run dev
```

---

## Quick Diagnostic Checklist

Run these commands in order:

```bash
# 1. Check auth schema exists
ls src/db/auth-schema.ts

# 2. Check config includes auth schema
grep "auth-schema.ts" drizzle.config.ts

# 3. Check environment variables
echo "CLIENT_ID: $APPLE_CLIENT_ID"
echo "TEAM_ID: $APPLE_TEAM_ID"
echo "KEY_ID: $APPLE_KEY_ID"

# 4. Run migrations
npm run db:migrate

# 5. Check OAuth status
curl https://your-api-url/api/oauth/status

# 6. Test callback debug endpoint
curl "https://your-api-url/api/oauth/apple/callback-debug?code=TEST"

# 7. Check server logs
npm run dev
```

---

## Testing the Fix

### Step 1: Verify Setup
```bash
curl https://your-api-url/api/oauth/status
```

Expected response:
```json
{
  "status": "ok",
  "appleOAuthConfigured": true,
  "details": {
    "message": "Apple OAuth is configured"
  }
}
```

### Step 2: Test Debug Callback
```bash
curl "https://your-api-url/api/oauth/apple/callback-debug?code=ABC123&state=XYZ789"
```

Expected response:
```json
{
  "success": true,
  "message": "Authorization code received. Redirecting to Better Auth...",
  "debugInfo": { ... }
}
```

### Step 3: Test Full OAuth Flow
1. Click "Sign in with Apple" button in your app
2. Complete Apple authentication
3. Should redirect to your app without errors
4. Session should be created

---

## Enabling Debug Logging

**Development** (most detailed):
```bash
DEBUG=better-auth:*,fastify:* npm run dev
```

**Production** (important events only):
```bash
export LOG_LEVEL=info
npm run prod
```

---

## Database Schema Check

Verify these Better Auth tables exist:

```bash
# Connect to database and check tables
psql $DATABASE_URL -c "\dt auth.*"

# Should show:
# - auth.user
# - auth.session
# - auth.account
# - auth.verification
# - auth.passkey (if WebAuthn enabled)
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `internal_server_error` | Missing auth schema | Run `npm run db:migrate` |
| `invalid_client` | Wrong Bundle ID or Team ID | Check environment variables |
| `invalid_grant` | Code expired or reused | Try again with fresh code |
| `redirect_uri_mismatch` | URI doesn't match config | Update Apple Developer Console |
| `ECONNREFUSED` | API not running | Start server with `npm run dev` |
| `ETIMEDOUT` | Network issue | Check internet connection |

---

## Getting Help

If issues persist:

1. **Check logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Run migrations** to ensure database is ready
4. **Test status endpoint** to confirm configuration
5. **Use debug endpoint** to trace callback flow
6. **Check Apple Developer Console** for configuration errors

---

## Performance Considerations

### Optimize OAuth Flow Speed

1. **Parallel token exchange**: Better Auth does this automatically
2. **Session caching**: Configured in Better Auth
3. **Database indexes**: Automatically created on migration

### Monitor Performance

```bash
# Check session creation time
curl -w "@curl-format.txt" -o /dev/null -s https://your-api-url/api/auth/get-session

# Profile OAuth flow
DEBUG=better-auth:perf npm run dev
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All Apple credentials set in environment
- [ ] Database migrated in production
- [ ] Redirect URI updated in Apple Developer Console
- [ ] HTTPS enabled for API domain
- [ ] Session security settings configured
- [ ] Logs monitored for OAuth errors
- [ ] Tested on real iOS device
- [ ] Tested on real Android device
- [ ] Tested web OAuth flow
- [ ] Tested Expo deep linking

---

## References

- Better Auth Docs: https://better-auth.com/docs
- Apple Sign-In Docs: https://developer.apple.com/sign-in-with-apple
- OAuth 2.0 Spec: https://tools.ietf.org/html/rfc6749
