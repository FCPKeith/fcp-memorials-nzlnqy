# Float in Coffin API Endpoints

## Overview

Complete API reference for the Float in Coffin memorials backend. The API uses:
- **Authentication**: Better Auth with Cookie-based sessions and Bearer tokens
- **Error Handling**: JSON error responses with meaningful messages
- **Logging**: Comprehensive request/response logging for debugging
- **CORS**: Configured for web, mobile, and Expo clients

---

## Health & Monitoring Endpoints

### Health Check
```http
GET /health
```

**Description**: Quick health check for monitoring API availability

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "auth": "ok",
    "storage": "ok"
  }
}
```

**Response (503 Service Unavailable)** - If database unavailable:
```json
{
  "status": "degraded",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": "degraded",
    "auth": "ok",
    "storage": "ok"
  }
}
```

**Use Cases**:
- Load balancer health checks
- Kubernetes liveness probes
- Monitoring dashboards
- CI/CD pipeline checks

---

### Detailed Health Check
```http
GET /api/health/detailed
```

**Description**: Comprehensive system diagnostics with performance metrics

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "latency": "45ms",
      "records": 142
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

**Use Cases**:
- Detailed monitoring and alerting
- Performance tracking
- Capacity planning
- Incident investigation

---

## Authentication Endpoints

### Get Current Session
```http
GET /api/session
```

**Description**: Retrieve current authenticated user's session data

**Headers**:
```
Cookie: sessionId=abc123...  (automatically set after login)
```

**Response (200 OK)** - If authenticated:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg",
    "emailVerified": true
  },
  "session": {
    "id": "session_123",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "expiresAt": "2024-01-22T10:00:00.000Z"
  }
}
```

**Response (401 Unauthorized)** - If not authenticated:
```json
{
  "error": "unauthorized",
  "message": "No active session. Please sign in first."
}
```

**Use Cases**:
- Check if user is logged in
- Retrieve full user profile
- Verify session validity
- Get session expiration time

---

### Get Current User Profile
```http
GET /api/me
```

**Description**: Retrieve minimal profile of authenticated user (convenience alias)

**Headers**:
```
Cookie: sessionId=abc123...
```

**Response (200 OK)** - If authenticated:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://example.com/avatar.jpg"
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "unauthorized",
  "message": "Please sign in to access your profile."
}
```

**Use Cases**:
- Quick user info retrieval
- Check authenticated user's email
- Get user's display name
- Fetch user's profile picture

---

### Validate Bearer Token
```http
GET /api/auth/validate
```

**Description**: Validate Bearer token in Authorization header

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)** - If token is valid:
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

**Response (401 Unauthorized)** - If token invalid or missing:
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

**Use Cases**:
- API client token validation
- Microservice authentication
- Mobile app token refresh
- Token-based rate limiting

---

## OAuth Authentication (Better Auth)

### Sign In with Social Provider
```http
POST /api/auth/sign-in/social
Content-Type: application/json

{
  "provider": "apple",
  "code": "authorization_code_from_apple",
  "callbackURL": "https://your-api-domain.com/api/auth/oauth-callback/apple"
}
```

**Providers Supported**:
- `apple` - Apple Sign-In
- `google` - Google OAuth (if configured)
- `github` - GitHub OAuth (if configured)

**Response (200 OK)** - If authentication succeeds:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "session_123"
  }
}
```

**OAuth Flow** (Automatic by Better Auth):
1. `POST /api/auth/sign-in/social` with authorization code
2. Better Auth exchanges code for tokens with provider
3. User account created/linked
4. Session created
5. HTTP-only secure cookie set
6. Response sent with user data

---

### OAuth Callback (Automatic)
```http
GET /api/auth/oauth-callback/apple?code=ABC123&state=XYZ789
```

**Note**: This endpoint is automatically handled by Better Auth. The OAuth provider (Apple) redirects here.

**Flow**:
1. User authenticates with Apple
2. Apple redirects to this endpoint with authorization code
3. Better Auth exchanges code for tokens
4. Session created
5. Redirects to `redirect_to` parameter or app URL

---

### Sign Out
```http
POST /api/auth/sign-out
Content-Type: application/json
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Effects**:
- Session cookie cleared
- Session marked as inactive
- User logged out

---

### Get Current Session (Better Auth)
```http
GET /api/auth/get-session
```

**Note**: This is a Better Auth endpoint, available by default.

**Response (200 OK)** - If authenticated:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "session_123",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Response (200 OK)** - If not authenticated:
```json
null
```

---

## Memorial Endpoints

### Get Memorial by ID
```http
GET /api/memorials/:id
```

**Parameters**:
- `id` (UUID) - Memorial ID

**Response (200 OK)**:
```json
{
  "id": "memorial_uuid",
  "full_name": "John Smith",
  "birth_date": "1945-06-15",
  "death_date": "2023-12-20",
  "story_text": "A loving husband and grandfather...",
  "photos": ["https://...", "https://..."],
  "video_link": "https://...",
  "audio_narration_link": "https://...",
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "location_visibility": "exact",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/...",
  "public_url": "john-smith-1945",
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Memorial not found"
}
```

---

### Get Memorial by URL Slug
```http
GET /api/memorials/by-url/:publicUrl
```

**Parameters**:
- `publicUrl` (string) - Memorial slug (e.g., "john-smith-1945")

**Response (200 OK)**:
```json
{
  "id": "memorial_uuid",
  "full_name": "John Smith",
  ...
}
```

---

### Resolve Memorial (Universal QR)
```http
GET /api/memorials/resolve/:slug
```

**Parameters**:
- `slug` (string) - Memorial slug for universal QR code resolution

**Use**: Called when user scans universal QR code

**Response (200 OK)**:
```json
{
  "id": "memorial_uuid",
  "full_name": "John Smith",
  ...
}
```

---

### Get All Memorials for Map
```http
GET /api/memorials/map
```

**Description**: Get all published memorials with location data for map display

**Response (200 OK)**:
```json
[
  {
    "id": "memorial_1",
    "full_name": "John Smith",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "location_visibility": "exact",
    "public_url": "john-smith-1945"
  },
  {
    "id": "memorial_2",
    "full_name": "Jane Doe",
    "latitude": "34.0522",
    "longitude": "-118.2437",
    "location_visibility": "approximate",
    "public_url": "jane-doe-1950"
  }
]
```

---

## Memorial Requests (Submission)

### Create Memorial Request
```http
POST /api/memorial-requests
Content-Type: application/json

{
  "requester_name": "Jane Smith",
  "requester_email": "jane@example.com",
  "loved_one_name": "John Smith",
  "birth_date": "1945-06-15",
  "death_date": "2023-12-20",
  "story_notes": "A wonderful man...",
  "media_uploads": ["https://...", "https://..."],
  "location_info": "Mountain View Cemetery",
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "tier_selected": "tier_2_remembered",
  "preservation_addon": true,
  "preservation_billing_cycle": "yearly",
  "discount_requested": false,
  "country": "United States"
}
```

**Required Fields**:
- `requester_name` - Person submitting the memorial
- `requester_email` - Contact email
- `loved_one_name` - Name of deceased
- `story_notes` - Written tribute
- `tier_selected` - Service tier

**Tier Options**:
- `tier_1_marked` - $75 (GPS pin, name, short story, up to 5 photos)
- `tier_2_remembered` - $125 (Everything in Tier 1 + narration + 10 photos + 1 video)
- `tier_3_enduring` - $200 (Everything in Tier 2 + extended story + 20 photos + multiple videos)

**Response (201 Created)**:
```json
{
  "id": "request_uuid",
  "payment_amount": 137.5,
  "request_status": "submitted",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Automatic Actions**:
- 💾 Saved to database
- 📧 Email notification sent to floatincoffin@icloud.com
- 💰 Payment amount calculated (tier + add-on - discount)
- 📍 QR code generated after approval/publishing

**Payment Calculation**:
```
Base Price = Tier Price (e.g., $125)
Add-on = $0 or Preservation Fee ($2/month or $12/year)
Subtotal = Base Price + Add-on
Final = Subtotal * (1 - Discount%) if discount_requested
```

---

### Process Payment for Memorial Request
```http
POST /api/memorial-requests/:id/payment
Content-Type: application/json

{
  "stripe_payment_id": "pi_1234567890",
  "payment_status": "completed"
}
```

**Parameters**:
- `id` - Memorial request ID

**Body**:
- `stripe_payment_id` - Payment intent ID from Stripe
- `payment_status` - "completed" or "failed"

**Response (200 OK)**:
```json
{
  "success": true,
  "request_status": "under_review"
}
```

---

## Admin Endpoints (Authentication Required)

### Get All Memorial Requests
```http
GET /api/admin/memorial-requests?status=submitted&discount_requested=false
Authorization: Bearer {token}
```

**Query Parameters** (optional):
- `status` - Filter by status (submitted, under_review, approved, published, rejected)
- `discount_requested` - Filter by discount (true/false)

**Response (200 OK)**:
```json
[
  {
    "id": "request_1",
    "requester_name": "Jane Smith",
    "loved_one_name": "John Smith",
    "request_status": "submitted",
    "tier_selected": "tier_2_remembered",
    "payment_amount": "125.00",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
]
```

**Response (401 Unauthorized)**:
```json
{
  "error": "Unauthorized"
}
```

---

### Update Memorial Request Status
```http
PUT /api/admin/memorial-requests/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "request_status": "approved"
}
```

**Status Values**:
- `submitted` - Initial state
- `under_review` - Being reviewed by admin
- `approved` - Approved, ready to publish
- `published` - Published as memorial
- `rejected` - Rejected with reason

**Response (200 OK)**:
```json
{
  "id": "request_1",
  "request_status": "approved",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

---

### Create Memorial from Approved Request
```http
POST /api/admin/memorials
Content-Type: application/json
Authorization: Bearer {token}

{
  "request_id": "request_uuid",
  "full_name": "John Smith",
  "birth_date": "1945-06-15",
  "death_date": "2023-12-20",
  "story_text": "Full biography...",
  "photos": ["https://...", "https://..."],
  "video_link": "https://...",
  "audio_narration_link": "https://...",
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "location_visibility": "exact"
}
```

**Response (201 Created)**:
```json
{
  "id": "memorial_uuid",
  "full_name": "John Smith",
  "public_url": "john-smith-1945",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=...",
  "published_status": true,
  "created_at": "2024-01-15T11:00:00.000Z"
}
```

**Automatic Actions**:
- 🎯 Universal QR code generated
- 📍 Memorial published publicly
- 📧 Email sent to submitter with QR code
- 🔗 Short URL created (john-smith-1945)

---

### Update Memorial
```http
PUT /api/admin/memorials/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "story_text": "Updated biography...",
  "photos": ["https://...", "https://..."],
  "published_status": true
}
```

**Response (200 OK)**:
```json
{
  "id": "memorial_uuid",
  "story_text": "Updated biography...",
  "updated_at": "2024-01-15T11:30:00.000Z"
}
```

---

### Delete Memorial (Soft Delete)
```http
DELETE /api/admin/memorials/:id
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Note**: Sets `published_status` to false. Data is not removed.

---

## File Upload

### Upload Media
```http
POST /api/upload
Content-Type: multipart/form-data

[Binary file data]
```

**Supported Types**:
- Images: JPG, PNG, WebP, GIF
- Videos: MP4, WebM, MOV
- Audio: MP3, WAV, M4A

**Response (200 OK)**:
```json
{
  "url": "https://storage.example.com/uploads/file_uuid.jpg"
}
```

---

## OAuth Debug Endpoints

### Check OAuth Configuration
```http
GET /api/oauth/status
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "environment": "production",
  "appleOAuthConfigured": true,
  "trustedOrigins": [
    "https://fcpmemorials.com",
    "exp://**"
  ],
  "details": {
    "message": "Apple OAuth is configured"
  }
}
```

---

### Debug OAuth Callback
```http
GET /api/oauth/apple/callback-debug?code=ABC123&state=XYZ789&redirect_to=https://example.com
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authorization code received. Redirecting to Better Auth..."
}
```

**Use**: For testing Apple OAuth callback flow without full authentication.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "invalid_request",
  "message": "Missing required field: requester_name"
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "No active session. Please sign in first."
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Memorial not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred"
}
```

### 503 Service Unavailable
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Database connection failed"
}
```

---

## Authentication Methods

### Cookie-based (Web/Expo)
```http
GET /api/session
Cookie: sessionId=abc123def456
```

**Automatic**: Set after login, sent with every request

---

### Bearer Token (API Clients)
```http
GET /api/auth/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Usage**: For mobile apps, microservices, or API clients

---

## Rate Limiting

Current endpoints are not rate limited in development.

**Production**: Configure rate limiting based on:
- IP address
- API key / user ID
- OAuth scope
- Endpoint sensitivity

---

## Logging

All requests are logged with:
- **Method & Path**: GET /api/memorials/:id
- **Status Code**: 200, 404, etc.
- **Duration**: Response time in ms
- **User ID**: If authenticated
- **Error Details**: If applicable

**Development**: Check console output
**Production**: Check application logs / monitoring service

---

## Pagination (Future)

Endpoints supporting large datasets will implement pagination:
```http
GET /api/memorials?page=1&limit=20
```

Currently all endpoints return full results.

---

## Versioning

Current API version: **v1** (default)

Future versions will be accessible at:
```http
GET /api/v2/memorials
```

Current endpoints automatically use latest version.

---

## Best Practices

### Authentication
✅ Always include session cookie or Bearer token
✅ Check `/api/session` before protected operations
✅ Handle 401 responses by redirecting to login
✅ Refresh token before expiration

### Error Handling
✅ Check HTTP status code
✅ Parse `error` field for error type
✅ Display `message` field to users
✅ Log `err` object in development

### Performance
✅ Cache `/api/me` results client-side
✅ Use `/api/memorials/map` for map data (optimized)
✅ Batch memorial requests to reduce API calls
✅ Implement pagination for large datasets

### Security
✅ Never expose error details in production
✅ Validate all user inputs
✅ Use HTTPS in production
✅ Keep Bearer tokens secure
✅ Implement CSRF protection

---

## Support

For API issues or questions:
1. Check this documentation
2. Check `/api/health/detailed` for system status
3. Review application logs
4. Contact support team

---

Last Updated: 2024-01-15
API Version: 1.0.0
