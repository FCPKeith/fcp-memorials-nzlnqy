# API Testing Guide

Quick reference for testing all new and existing API endpoints.

## Start Server

```bash
npm run dev
```

Expected output:
```
Application running with Apple Sign-In OAuth support
```

---

## Health Check Endpoints

### Test Basic Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "development",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "auth": "ok",
    "storage": "ok"
  }
}
```

### Test Detailed Health Check
```bash
curl http://localhost:3000/api/health/detailed
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "latency": "45ms",
      "records": 5
    },
    "auth": {
      "status": "ok",
      "latency": "12ms"
    },
    "memory": {
      "usage": {
        "heapUsed": "128MB",
        "heapTotal": "256MB",
        "rss": "512MB"
      }
    }
  },
  "diagnostics": {
    "totalCheckTime": "65ms",
    "nodeVersion": "v18.0.0",
    "platform": "linux",
    "arch": "x64"
  }
}
```

---

## Session & Authentication Endpoints

### Test Get Current Session (Not Authenticated)
```bash
curl http://localhost:3000/api/session
```

**Expected Response (401)**:
```json
{
  "error": "unauthorized",
  "message": "No active session. Please sign in first."
}
```

### Test Get Current User (Not Authenticated)
```bash
curl http://localhost:3000/api/me
```

**Expected Response (401)**:
```json
{
  "error": "unauthorized",
  "message": "Please sign in to access your profile."
}
```

### Test Validate Token (Invalid Token)
```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/auth/validate
```

**Expected Response (401)**:
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

---

## OAuth Configuration

### Test OAuth Status
```bash
curl http://localhost:3000/api/oauth/status
```

**Expected Response**:
```json
{
  "status": "ok",
  "environment": "development",
  "trustedOrigins": [
    "http://localhost:3000",
    "http://localhost:8081",
    "exp://**",
    "https://fcpmemorials.com",
    "https://*.fcpmemorials.com"
  ],
  "appleOAuthConfigured": false,
  "details": {
    "message": "Apple OAuth is NOT configured. Check APPLE_CLIENT_ID and APPLE_TEAM_ID environment variables."
  }
}
```

**Note**: Will show `appleOAuthConfigured: false` until environment variables are set.

### Test OAuth Callback Debug
```bash
curl "http://localhost:3000/api/oauth/apple/callback-debug?code=TEST_CODE&state=TEST_STATE&redirect_to=http://localhost:3000"
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Authorization code received. Redirecting to Better Auth..."
}
```

### Test OAuth Callback with Error
```bash
curl "http://localhost:3000/api/oauth/apple/callback-debug?error=user_cancelled_login&error_description=User%20cancelled%20login"
```

**Expected Response (400)**:
```json
{
  "success": false,
  "error": "user_cancelled_login",
  "description": "User cancelled login"
}
```

---

## Memorial Endpoints

### Test Get All Map Data
```bash
curl http://localhost:3000/api/memorials/map
```

**Expected Response (200)**:
```json
[]
```

*(Empty array if no memorials published)*

### Test Get Memorial by Slug (Not Found)
```bash
curl http://localhost:3000/api/memorials/resolve/nonexistent
```

**Expected Response (404)**:
```json
{
  "error": "Memorial not found"
}
```

---

## Memorial Request Submission

### Test Submit Memorial Request
```bash
curl -X POST http://localhost:3000/api/memorial-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requester_name": "Jane Smith",
    "requester_email": "jane@example.com",
    "loved_one_name": "John Smith",
    "story_notes": "A wonderful man",
    "tier_selected": "tier_1_marked",
    "country": "United States"
  }'
```

**Expected Response (201)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_amount": 7500,
  "request_status": "submitted",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### Test Submit with All Fields
```bash
curl -X POST http://localhost:3000/api/memorial-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requester_name": "Jane Smith",
    "requester_email": "jane@example.com",
    "loved_one_name": "John Smith",
    "birth_date": "1945-06-15",
    "death_date": "2023-12-20",
    "story_notes": "A loving grandfather",
    "media_uploads": ["https://example.com/photo1.jpg"],
    "location_info": "Mountain View Cemetery",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "tier_selected": "tier_2_remembered",
    "preservation_addon": true,
    "preservation_billing_cycle": "yearly",
    "discount_requested": true,
    "discount_type": "military",
    "country": "United States"
  }'
```

**Expected Response (201)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_amount": 10625,
  "request_status": "submitted",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Calculation**:
- Base: $125 (tier_2_remembered)
- Add-on: $12/year (preservation_addon yearly)
- Subtotal: $137
- Discount: $137 * 0.15 = $20.55 off
- **Final: $116.45 (shown as 10625 cents)**

---

## Testing Workflow

### Complete Memorial Submission Flow

1. **Submit Request**
   ```bash
   curl -X POST http://localhost:3000/api/memorial-requests \
     -H "Content-Type: application/json" \
     -d '{ "requester_name": "Jane", "requester_email": "jane@example.com", "loved_one_name": "John", "story_notes": "Story", "tier_selected": "tier_1_marked" }'
   ```
   Save the returned `id` (request_id)

2. **Check Request Status** (Admin)
   ```bash
   curl http://localhost:3000/api/admin/memorial-requests
   ```

3. **Approve Request** (Admin)
   ```bash
   curl -X PUT http://localhost:3000/api/admin/memorial-requests/{request_id} \
     -H "Content-Type: application/json" \
     -d '{ "request_status": "approved" }'
   ```

4. **Create Memorial** (Admin)
   ```bash
   curl -X POST http://localhost:3000/api/admin/memorials \
     -H "Content-Type: application/json" \
     -d '{
       "request_id": "{request_id}",
       "full_name": "John Smith",
       "birth_date": "1945-06-15",
       "death_date": "2023-12-20",
       "story_text": "Full story",
       "photos": ["https://example.com/photo.jpg"],
       "location_visibility": "exact"
     }'
   ```
   Save the returned `public_url`

5. **View Published Memorial**
   ```bash
   curl http://localhost:3000/api/memorials/resolve/{public_url}
   ```

6. **View on Map**
   ```bash
   curl http://localhost:3000/api/memorials/map
   ```

---

## Using cURL with Different Formats

### Pretty Print JSON Response
```bash
curl http://localhost:3000/health | jq
```

### Save Response to File
```bash
curl http://localhost:3000/health -o health.json
cat health.json | jq
```

### Check Response Headers
```bash
curl -i http://localhost:3000/health
```

### Follow Redirects
```bash
curl -L http://localhost:3000/some-redirect
```

### Show Timing Information
```bash
curl -w "\nTotal Time: %{time_total}s\n" http://localhost:3000/health
```

---

## Testing with Postman

### Import Collection

1. In Postman, click "Import"
2. Create new request for each endpoint:

**Health Check**
- Method: GET
- URL: `http://localhost:3000/health`

**Get Session**
- Method: GET
- URL: `http://localhost:3000/api/session`
- Expected: 401 (not authenticated)

**Submit Memorial**
- Method: POST
- URL: `http://localhost:3000/api/memorial-requests`
- Body (JSON):
  ```json
  {
    "requester_name": "Test User",
    "requester_email": "test@example.com",
    "loved_one_name": "Deceased Name",
    "story_notes": "Story text",
    "tier_selected": "tier_1_marked"
  }
  ```

---

## Testing with JavaScript/Node.js

```javascript
// test-api.js
const BASE_URL = 'http://localhost:3000';

async function testHealthCheck() {
  const response = await fetch(`${BASE_URL}/health`);
  const data = await response.json();
  console.log('Health:', data);
  return response.ok;
}

async function testSession() {
  const response = await fetch(`${BASE_URL}/api/session`);
  const data = await response.json();
  console.log('Session:', data);
  return response.status;
}

async function testSubmitMemorial() {
  const response = await fetch(`${BASE_URL}/api/memorial-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requester_name: 'Jane Smith',
      requester_email: 'jane@example.com',
      loved_one_name: 'John Smith',
      story_notes: 'A wonderful man',
      tier_selected: 'tier_1_marked'
    })
  });
  const data = await response.json();
  console.log('Memorial Request:', data);
  return data;
}

async function runTests() {
  console.log('\n=== API Testing ===\n');

  console.log('1. Health Check...');
  await testHealthCheck();

  console.log('\n2. Get Session (should fail)...');
  await testSession();

  console.log('\n3. Submit Memorial Request...');
  const result = await testSubmitMemorial();

  console.log('\n=== Tests Complete ===\n');
}

runTests().catch(console.error);
```

**Run tests**:
```bash
node test-api.js
```

---

## Monitoring Logs

### Watch Logs in Real-time
```bash
npm run dev 2>&1 | grep -E "health|session|oauth|memorial|error"
```

### Filter for Errors Only
```bash
npm run dev 2>&1 | grep -i error
```

### Save Logs to File
```bash
npm run dev > api.log 2>&1 &
tail -f api.log
```

---

## Performance Testing

### Test Response Time
```bash
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s http://localhost:3000/health
done
```

### Load Testing with ApacheBench
```bash
# Install: brew install httpd
ab -n 100 -c 10 http://localhost:3000/health
```

### Load Testing with wrk
```bash
# Install: brew install wrk
wrk -t4 -c100 -d30s http://localhost:3000/health
```

---

## Debugging Tips

1. **Check Server Logs**: Look for detailed error messages
2. **Verify Environment Variables**: `echo $DATABASE_URL`
3. **Test Database**: `npm run db:check`
4. **Check Port**: `lsof -i :3000`
5. **Clear Cache**: `rm -rf node_modules/.cache`
6. **Restart Server**: Stop and start with `npm run dev`

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 503 Service Unavailable | Check database connection with `npm run db:check` |
| 401 Unauthorized on protected routes | Sign in first with OAuth or email/password |
| CORS errors | Check `trustedOrigins` in `src/index.ts` |
| Slow responses | Check `/api/health/detailed` for bottlenecks |
| Missing environment variables | Copy `.env.apple-signin.example` to `.env.local` |

---

## Next Steps

1. ✅ Run health checks to verify API is up
2. ✅ Test session endpoints
3. ✅ Submit a memorial request
4. ✅ Check logs for any errors
5. ✅ Implement client-side integration
6. ✅ Test OAuth flow with Apple credentials
7. ✅ Deploy to production
8. ✅ Monitor with production health checks

---

Last Updated: 2024-01-15
