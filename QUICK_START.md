
# FCP Memorials - Quick Start Guide

## 🚀 Start the App

```bash
npm run dev
```

## 🧪 Test the Integration

### 1. Public Features (No Login)

#### View Memorials on Map
1. Open app → Navigate to "Map" tab
2. See memorial markers on the map
3. Tap a marker to view memorial details

#### Request a Memorial
1. Navigate to "Request" tab
2. Fill in the form and submit
3. See success message with request ID

### 2. Admin Features (Login Required)

#### Sign Up
1. Navigate to `/auth` or access admin area
2. Create account:
   - Email: `admin@fcpmemorials.com`
   - Password: `Admin123!`

#### Manage Requests
1. After login → Admin Dashboard
2. Click "View All Requests"
3. Tap any request → Update status

## 📡 Backend API

**URL**: https://zx9m4wtvay3c52kkt4rane79tkz3gpu2.app.specular.dev

### Public Endpoints
- `GET /api/memorials/by-url/:publicUrl` - View memorial
- `GET /api/memorials/map` - Get memorial locations
- `POST /api/memorial-requests` - Submit request

### Admin Endpoints (Auth Required)
- `GET /api/admin/memorial-requests` - List requests
- `PUT /api/admin/memorial-requests/:id` - Update status

## 🔑 Key Files

- `utils/api.ts` - API utilities
- `contexts/AuthContext.tsx` - Auth state
- `app/memorial/[id].tsx` - Memorial detail
- `app/(tabs)/(map)/index.tsx` - Map view
- `app/request-memorial.tsx` - Request form
- `app/(admin)/index.tsx` - Admin dashboard

## 🎯 What's Integrated

✅ Memorial viewing (public)
✅ Map with locations (public)
✅ QR code scanning (public)
✅ Memorial requests (public)
✅ Admin authentication (Better Auth)
✅ Admin dashboard (protected)
✅ Request management (protected)

## 🐛 Troubleshooting

**"Backend URL not configured"**
→ Check `app.json` → `expo.extra.backendUrl`

**"Authentication token not found"**
→ Sign in again

**"Failed to load memorials"**
→ Check backend is running

## 📚 Full Documentation

See `INTEGRATION_GUIDE.md` for comprehensive testing guide.
See `BACKEND_INTEGRATION_SUMMARY.md` for technical details.

---

**Ready to test! 🎉**
