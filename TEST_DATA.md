
# Test Data for FCP Memorials

## 🧪 Sample Memorial Requests

### Basic Tier Request
```json
{
  "requester_name": "John Smith",
  "requester_email": "john.smith@example.com",
  "loved_one_name": "Mary Smith",
  "birth_date": "1950-05-15",
  "death_date": "2023-12-01",
  "story_notes": "Mary was a devoted teacher who touched the lives of hundreds of students over her 40-year career. She loved gardening, reading, and spending time with her grandchildren.",
  "location_info": "Green Hills Cemetery, Section B, Plot 42",
  "tier_selected": "basic",
  "discount_requested": false
}
```

### Standard Tier with Military Discount
```json
{
  "requester_name": "Sarah Johnson",
  "requester_email": "sarah.j@example.com",
  "loved_one_name": "Colonel James Johnson",
  "birth_date": "1945-03-20",
  "death_date": "2024-01-15",
  "story_notes": "Colonel James Johnson served his country with honor for 30 years in the United States Army. He was a loving father, grandfather, and mentor to many young officers. His dedication to duty and family was unwavering.",
  "location_info": "Arlington National Cemetery",
  "tier_selected": "standard",
  "discount_requested": true,
  "discount_type": "military"
}
```

### Premium Tier with First Responder Discount
```json
{
  "requester_name": "Michael Brown",
  "requester_email": "m.brown@example.com",
  "loved_one_name": "Captain Robert Brown",
  "birth_date": "1970-08-10",
  "death_date": "2023-09-11",
  "story_notes": "Captain Robert Brown was a firefighter for 25 years, saving countless lives and serving his community with courage and compassion. He was a hero to his family and his city. His legacy of service will never be forgotten.",
  "location_info": "Riverside Memorial Park",
  "tier_selected": "premium",
  "discount_requested": true,
  "discount_type": "first_responder"
}
```

## 👤 Sample Admin Credentials

### Admin User
```
Email: admin@fcpmemorials.com
Password: Admin123!
```

### Test Admin User
```
Email: test.admin@fcpmemorials.com
Password: TestAdmin123!
```

## 🗺️ Sample Memorial Data (for backend seeding)

### Memorial 1
```json
{
  "full_name": "John Doe",
  "birth_date": "1945-03-15",
  "death_date": "2023-11-20",
  "story_text": "John Doe was a beloved father, grandfather, and friend. He served his country with honor in the United States Marine Corps and dedicated his life to helping others. His kindness, wisdom, and unwavering spirit touched the lives of everyone he met. He will be deeply missed but never forgotten.",
  "photos": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800"
  ],
  "latitude": 37.7749,
  "longitude": -122.4194,
  "location_visibility": "exact",
  "public_url": "john-doe-1945",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=john-doe-1945",
  "published_status": true
}
```

### Memorial 2
```json
{
  "full_name": "Jane Smith",
  "birth_date": "1952-07-22",
  "death_date": "2024-01-10",
  "story_text": "Jane Smith was a dedicated teacher who inspired generations of students. Her passion for education and her warm, caring nature made her a beloved figure in her community. She loved reading, traveling, and spending time with her family. Her legacy lives on in the countless lives she touched.",
  "photos": [
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800"
  ],
  "latitude": 34.0522,
  "longitude": -118.2437,
  "location_visibility": "exact",
  "public_url": "jane-smith-1952",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=jane-smith-1952",
  "published_status": true
}
```

### Memorial 3
```json
{
  "full_name": "Robert Williams",
  "birth_date": "1960-12-05",
  "death_date": "2023-08-30",
  "story_text": "Robert Williams was a skilled craftsman and devoted family man. He built beautiful furniture that will be treasured for generations. His sense of humor, generosity, and love for his family defined his life. He is remembered with love and gratitude.",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800"
  ],
  "latitude": 40.7128,
  "longitude": -74.0060,
  "location_visibility": "approximate",
  "public_url": "robert-williams-1960",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=robert-williams-1960",
  "published_status": true
}
```

## 🔗 Sample QR Code URLs

Generate QR codes for testing:

1. **John Doe Memorial**
   - URL: `https://fcpmemorials.com/memorial/john-doe-1945`
   - QR: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=john-doe-1945`

2. **Jane Smith Memorial**
   - URL: `https://fcpmemorials.com/memorial/jane-smith-1952`
   - QR: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=jane-smith-1952`

3. **Robert Williams Memorial**
   - URL: `https://fcpmemorials.com/memorial/robert-williams-1960`
   - QR: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=robert-williams-1960`

## 💰 Pricing Reference

### Service Tiers
- **Basic**: $299
  - Written story + 3 photos + QR code
  
- **Standard**: $499
  - Written story + 10 photos + video + QR code
  
- **Premium**: $799
  - Written story + unlimited photos + video + audio narration + QR code

### Discounts
- **Military**: 15% off (requires verification)
- **First Responder**: 15% off (requires verification)

### Calculated Prices with Discount
- Basic: $299 → $254.15
- Standard: $499 → $424.15
- Premium: $799 → $679.15

## 📧 Sample Email Addresses

For testing different user types:

```
admin@fcpmemorials.com
test.admin@fcpmemorials.com
john.smith@example.com
sarah.j@example.com
m.brown@example.com
requester1@test.com
requester2@test.com
```

## 🧪 Testing Scenarios

### Scenario 1: Public User Journey
1. Open app → View map
2. Tap memorial marker
3. View memorial details
4. Share memorial
5. Navigate to Request tab
6. Submit memorial request

### Scenario 2: Admin User Journey
1. Sign up as admin
2. View dashboard statistics
3. Navigate to requests list
4. Update request status
5. Sign out

### Scenario 3: QR Code Scanning
1. Generate QR code for a memorial
2. Open scanner tab
3. Scan QR code
4. View memorial details

### Scenario 4: Error Handling
1. Try to access admin without login → Redirect to auth
2. Submit invalid request → See error modal
3. Scan invalid QR code → See error modal
4. Network error → See retry option

---

**Use this data to thoroughly test all features! 🧪**
