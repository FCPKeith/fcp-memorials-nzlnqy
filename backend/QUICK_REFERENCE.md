# API Quick Reference Card

Fast lookup for common API endpoints and responses.

---

## Health & Status

```bash
# Quick health check
curl http://localhost:3000/health

# Detailed diagnostics
curl http://localhost:3000/api/health/detailed

# OAuth status
curl http://localhost:3000/api/oauth/status
```

---

## Authentication

```bash
# Get current session (requires login)
curl http://localhost:3000/api/session

# Get user profile (requires login)
curl http://localhost:3000/api/me

# Validate Bearer token
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/auth/validate

# Sign out
curl -X POST http://localhost:3000/api/auth/sign-out
```

---

## Memorials

```bash
# View published memorial
curl http://localhost:3000/api/memorials/:id

# Get by slug
curl http://localhost:3000/api/memorials/resolve/john-smith-1945

# Get all on map
curl http://localhost:3000/api/memorials/map
```

---

## Submit Memorial Request

```bash
curl -X POST http://localhost:3000/api/memorial-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requester_name": "Jane Smith",
    "requester_email": "jane@example.com",
    "loved_one_name": "John Smith",
    "story_notes": "A wonderful man",
    "tier_selected": "tier_1_marked"
  }'
```

**Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_amount": 7500,
  "request_status": "submitted",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

---

## Tier Prices (in cents)

| Tier | Price | Code |
|------|-------|------|
| Tier I - Marked | $75 | `tier_1_marked` |
| Tier II - Remembered | $125 | `tier_2_remembered` |
| Tier III - Enduring | $200 | `tier_3_enduring` |
| Preservation Add-on | $2/mo or $12/yr | Add `preservation_addon: true` |

---

## Admin Endpoints

```bash
# List all requests
curl http://localhost:3000/api/admin/memorial-requests

# Get specific request status
curl http://localhost:3000/api/admin/memorial-requests?status=submitted

# Approve request
curl -X PUT http://localhost:3000/api/admin/memorial-requests/{id} \
  -H "Content-Type: application/json" \
  -d '{"request_status": "approved"}'

# Create memorial
curl -X POST http://localhost:3000/api/admin/memorials \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "...",
    "full_name": "John Smith",
    "story_text": "...",
    "photos": ["..."],
    "location_visibility": "exact"
  }'
```

---

## Error Responses

All errors return:
```json
{
  "error": "error_code",
  "message": "Human-readable message"
}
```

Common codes:
- `401` - Not authenticated
- `403` - Permission denied
- `404` - Not found
- `500` - Server error
- `503` - Service unavailable

---

## Common Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | OK | Success |
| 201 | Created | Memorial created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource missing |
| 500 | Server Error | Unexpected error |
| 503 | Unavailable | Database down |

---

## Memorial Request States

```
submitted → under_review → approved → published
                                   ↓
                                rejected
```

- **submitted**: Initial state, awaiting review
- **under_review**: Admin reviewing submission
- **approved**: Ready to create memorial
- **published**: Memorial is live and public
- **rejected**: Submission was rejected

---

## Request Body Reference

### Submit Memorial Request
```json
{
  "requester_name": "string (required)",
  "requester_email": "string (required)",
  "loved_one_name": "string (required)",
  "birth_date": "YYYY-MM-DD (optional)",
  "death_date": "YYYY-MM-DD (optional)",
  "story_notes": "string (required)",
  "media_uploads": ["url", "url"] (optional),
  "location_info": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "tier_selected": "tier_1_marked|tier_2_remembered|tier_3_enduring (required)",
  "preservation_addon": true|false (optional),
  "preservation_billing_cycle": "monthly|yearly (optional)",
  "discount_requested": true|false (optional),
  "discount_type": "military|first_responder (optional)",
  "country": "string (optional)"
}
```

### Create Memorial (Admin)
```json
{
  "request_id": "uuid (required)",
  "full_name": "string (required)",
  "birth_date": "YYYY-MM-DD (optional)",
  "death_date": "YYYY-MM-DD (optional)",
  "story_text": "string (required)",
  "photos": ["url"] (required)",
  "video_link": "url (optional)",
  "audio_narration_link": "url (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "location_visibility": "exact|approximate|hidden (required)"
}
```

---

## Response Format

### Success (2xx)
```json
{
  "id": "...",
  "status": "...",
  "data": "..."
}
```

### Error (4xx, 5xx)
```json
{
  "error": "error_code",
  "message": "Description"
}
```

---

## Dates & Times

All timestamps in ISO 8601 format:
```
2024-01-15T10:30:00.000Z
```

Parse in JavaScript:
```javascript
const date = new Date('2024-01-15T10:30:00.000Z');
```

---

## Payment Calculation

Formula:
```
tierPrice = TIER_PRICES[tier_selected]
addOnPrice = (preservation_addon)
  ? (preservation_billing_cycle === 'monthly' ? 200 : 1200)
  : 0
subtotal = tierPrice + addOnPrice
discount = (discount_requested) ? subtotal * 0.15 : 0
final = subtotal - discount
```

Example (Tier II with yearly add-on and military discount):
```
$125 (tier) + $12 (add-on) = $137
$137 * 0.15 = $20.55 discount
$137 - $20.55 = $116.45
```

---

## Environment Setup

```bash
# Copy template
cp .env.apple-signin.example .env.local

# Set Apple OAuth (get from Apple Developer)
export APPLE_CLIENT_ID="com.fcpmemorials.app"
export APPLE_TEAM_ID="ABC123XYZ"
export APPLE_KEY_ID="KEY123ABC"
export APPLE_PRIVATE_KEY="[.p8 file content]"

# Set database
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

---

## Testing Commands

```bash
# Health check
curl http://localhost:3000/health | jq

# Get session (should fail)
curl http://localhost:3000/api/session | jq

# Submit memorial
curl -X POST http://localhost:3000/api/memorial-requests \
  -H "Content-Type: application/json" \
  -d '{"requester_name":"Test","requester_email":"test@test.com","loved_one_name":"John","story_notes":"Story","tier_selected":"tier_1_marked"}' | jq

# List memorials on map
curl http://localhost:3000/api/memorials/map | jq
```

---

## Useful Tools

```bash
# Pretty print JSON
curl ... | jq

# Save response to file
curl ... -o response.json

# Show headers
curl -i ...

# Measure time
curl -w "@curl-format.txt" ...

# Verbose output
curl -v ...
```

---

## Database Commands

```bash
# Check connection
npm run db:check

# Run migrations
npm run db:migrate

# Push schema
npm run db:push

# Studio (visual editor)
npm run db:studio
```

---

## Logging

```bash
# Watch logs
npm run dev 2>&1 | grep -i "error\|warning"

# Save to file
npm run dev > api.log 2>&1 &

# Real-time tail
tail -f api.log
```

---

## Performance Tips

1. Use `/api/memorials/map` for location data (optimized)
2. Cache `/api/me` results client-side
3. Batch memorial requests when possible
4. Use pagination for large datasets (coming soon)
5. Monitor `/api/health/detailed` for bottlenecks

---

## Security Tips

✅ Always use HTTPS in production
✅ Keep Bearer tokens secure
✅ Never log sensitive data
✅ Validate all inputs
✅ Use environment variables for secrets
✅ Implement rate limiting on production
✅ Monitor for unusual patterns

---

## Common Issues

| Issue | Fix |
|-------|-----|
| 503 Service Unavailable | `npm run db:check` |
| 401 Not Authenticated | Sign in via OAuth or email/password |
| CORS Error | Check trusted origins in `src/index.ts` |
| Slow responses | Check `/api/health/detailed` |
| 404 Not Found | Check correct endpoint path |

---

## Useful Links

- API Docs: `API_ENDPOINTS.md`
- Testing: `TESTING_GUIDE.md`
- OAuth Setup: `APPLE_SIGNIN_SETUP.md`
- Full Summary: `API_BUILD_SUMMARY.md`
- Troubleshooting: `OAUTH_CALLBACK_TROUBLESHOOTING.md`

---

## Quick Deploy

```bash
# Test build
npm run build

# Run in production mode
npm start

# Verify health
curl https://your-api-url/health
```

---

**Last Updated**: 2024-01-15
**API Version**: 1.0.0
