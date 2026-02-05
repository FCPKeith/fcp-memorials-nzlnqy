
# FCP Memorials - Stories That Remain

A respectful, minimalist digital memorial platform where anyone can scan QR codes at memorial sites to view loved ones' stories.

## Features

### Core Functionality (First Version)
- **QR Code Scanner**: Scan QR codes at memorial sites to instantly view memorials
- **Interactive Map**: Browse nearby memorials on an interactive map
- **Memorial Pages**: View full memorial details with photos, stories, and dates
- **Share Memorials**: Share memorial links with family and friends

### Design Philosophy
- Dark, respectful color palette
- Minimalist and dignified interface
- Accessible with large text and high contrast
- No religious symbols or assumptions
- Mobile-first, works on all devices

## Tech Stack

- **Frontend**: React Native + Expo 54
- **Navigation**: Expo Router (file-based routing)
- **Camera**: expo-camera (QR code scanning)
- **Maps**: Leaflet (web) / WebView (native)
- **Backend**: Specular (auto-generated API)

## Project Structure

```
app/
├── (tabs)/
│   ├── (scanner)/          # QR code scanner tab
│   │   └── index.tsx
│   └── (map)/              # Map view tab
│       └── index.tsx
├── memorial/
│   └── [id].tsx            # Memorial detail page
└── _layout.tsx             # Root layout

components/
├── FloatingTabBar.tsx      # Custom tab bar
├── IconSymbol.tsx          # Cross-platform icons
└── Map.tsx                 # Map component

styles/
└── commonStyles.ts         # Theme colors and styles
```

## Color Palette

- **Background**: #0A0A0A (Deep black)
- **Card**: #1A1A1A (Dark gray)
- **Text**: #E8E8E8 (Off-white)
- **Primary**: #8B7355 (Warm bronze/taupe)
- **Secondary**: #5A6B7D (Muted slate blue)
- **Accent**: #9B8B7E (Soft beige)

## Backend API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/memorials/:id` - Get memorial by ID
- `GET /api/memorials/by-url/:publicUrl` - Get memorial by URL slug
- `GET /api/memorials/map` - Get all memorials for map display
- `POST /api/memorial-requests` - Submit a new memorial request
- `POST /api/upload/media` - Upload photos/media

### Admin Endpoints (Auth Required)
- `GET /api/admin/memorial-requests` - View all requests
- `PUT /api/admin/memorial-requests/:id` - Update request status
- `POST /api/admin/memorials` - Create and publish memorial
- `PUT /api/admin/memorials/:id` - Update memorial
- `DELETE /api/admin/memorials/:id` - Soft delete memorial

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Scan the QR code with Expo Go app

## User Flow

1. **Visitor arrives at memorial site** → Sees QR code on marker
2. **Scans QR code** → Opens scanner tab in app
3. **Views memorial** → Reads story, views photos, sees dates
4. **Shares memorial** → Sends link to family/friends
5. **Browses map** → Discovers other nearby memorials

## Future Features (Not in First Version)

- Memorial request submission form
- Payment integration (Stripe)
- Admin dashboard for reviewing requests
- Audio narration playback
- Video integration
- User accounts (optional)
- Request status tracking

## Notes

- Viewing memorials is always free
- Payment only required to request new memorials
- All memorials are public once published
- No social features (no comments, likes, reactions)
- Respectful, dignified tone throughout
- International support (multiple currencies, date formats)

## License

Proprietary - FCP Memorials
