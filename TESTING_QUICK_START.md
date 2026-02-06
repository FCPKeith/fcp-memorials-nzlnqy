
# 🧪 Quick Testing Guide - Tiered Memorial Service

## 🚀 Start the App

```bash
npm run dev
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

---

## 📝 Test Scenario 1: Submit Memorial Request

### Steps:
1. Open the app
2. Navigate to **"Request"** tab (bottom navigation)
3. Fill in the form:
   ```
   Your Name: John Doe
   Your Email: test@example.com
   Loved One's Name: Jane Smith
   Birth Date: 1950-01-15
   Death Date: 2024-01-20
   Story: [Write a meaningful story]
   Location: Green Valley Cemetery
   Country: United States
   ```

4. **Select a Tier:**
   - ✅ Tier I — Marked ($75)
   - ⬜ Tier II — Remembered ($125)
   - ⬜ Tier III — Enduring ($200)

5. **Optional: Add Preservation**
   - ✅ Preservation & Hosting
   - Select: **Yearly ($12/year)** or **Monthly ($2/month)**

6. **Optional: Request Discount**
   - ✅ Military or First Responder discount (15% off)
   - Select: **Military** or **First Responder**

7. **Verify Price Calculation:**
   - Base: $75 (Tier I)
   - + Preservation: $12 (yearly)
   - Subtotal: $87
   - - Discount (15%): -$13.05
   - **Total: $73.95**

8. Click **"Submit Request"**

### Expected Result:
✅ Success modal appears with request ID
✅ Email sent to `floatincoffin@icloud.com`
✅ Request saved to database

---

## 🔐 Test Scenario 2: Admin Dashboard

### Steps:
1. Navigate to `/auth` (or click "Admin" if available)
2. **Sign Up** (first time):
   ```
   Email: admin@fcpmemorials.com
   Password: SecurePassword123!
   Name: Admin User
   ```
3. Or **Sign In** (returning user):
   ```
   Email: admin@fcpmemorials.com
   Password: SecurePassword123!
   ```

4. After authentication, you'll be redirected to `/admin`

5. View the dashboard:
   - Total Requests
   - Submitted
   - Under Review
   - Approved
   - Published

6. Click **"View All Requests"**

7. Find your test request and verify:
   - ✅ Tier: Tier I — Marked ($75)
   - ✅ Preservation Add-on: $12/year
   - ✅ Payment: $73.95 (pending)
   - ✅ Discount: military (15% off)

8. Click on the request to update status:
   - **Under Review** → Move to review
   - **Approve** → Approve for publishing
   - **Reject** → Reject the request

### Expected Result:
✅ Request status updates successfully
✅ Dashboard stats update in real-time

---

## 🗺️ Test Scenario 3: View Memorials on Map

### Steps:
1. Navigate to **"Map"** tab
2. Wait for memorials to load
3. Verify map displays with memorial markers
4. Click on a memorial marker
5. Verify memorial detail page opens

### Expected Result:
✅ Map loads with memorial locations
✅ Markers are clickable
✅ Memorial details display correctly

---

## 📱 Test Scenario 4: View Memorial Detail

### Steps:
1. From the map, click a memorial marker
2. Or navigate directly to `/memorial/[public-url]`
3. Verify the following displays:
   - ✅ Full name
   - ✅ Birth and death dates
   - ✅ Story text
   - ✅ Photo gallery (if available)
   - ✅ QR code
4. Click the **Share** button (top right)
5. Verify share sheet appears

### Expected Result:
✅ Memorial details load correctly
✅ Photos display in gallery
✅ Share functionality works

---

## 🧪 Test Scenario 5: Price Calculations

Test all tier combinations:

### Tier I Only:
- Base: $75
- **Total: $75**

### Tier I + Preservation (Yearly):
- Base: $75
- Preservation: $12
- **Total: $87**

### Tier I + Preservation (Monthly):
- Base: $75
- Preservation: $2
- **Total: $77**

### Tier I + Preservation (Yearly) + Discount:
- Base: $75
- Preservation: $12
- Subtotal: $87
- Discount (15%): -$13.05
- **Total: $73.95**

### Tier II + Preservation (Yearly) + Discount:
- Base: $125
- Preservation: $12
- Subtotal: $137
- Discount (15%): -$20.55
- **Total: $116.45**

### Tier III + Preservation (Yearly) + Discount:
- Base: $200
- Preservation: $12
- Subtotal: $212
- Discount (15%): -$31.80
- **Total: $180.20**

---

## 🔍 Verify Email Notification

Check `floatincoffin@icloud.com` for an email with:

```
Subject: New Memorial Request for [Loved One's Name]

Content:
- Request ID: [UUID]
- Submission Time: [ISO Date]
- Submitter Name: [Your Name]
- Submitter Email: [Your Email]
- Name of Deceased: [Loved One's Name]
- Birth Date: [Date]
- Death Date: [Date]
- Grave Location: [Location Info]
- Country: [Country]
- Service Tier: [tier_1_marked / tier_2_remembered / tier_3_enduring]
- Preservation Add-on: Yes ($12/year) or No
- Discount Requested: Yes (military) or No
- Story / Written Tribute: [Full Story]
- Uploaded Media: [Links]
```

---

## 🐛 Common Issues & Solutions

### Issue: "Backend URL not configured"
```bash
# Solution: Rebuild the app
npm run dev
```

### Issue: "Authentication token not found"
```bash
# Solution: Sign in again
# Navigate to /auth and sign in
```

### Issue: "Failed to load memorials"
```bash
# Solution: Check backend is running
# Verify: https://pwesm38m2s562pv8mecxsgwjqsk4267e.app.specular.dev
```

### Issue: Modal not appearing
```bash
# Solution: Check console for errors
# Verify Modal component is imported correctly
```

---

## ✅ Testing Checklist

- [ ] Memorial request form loads
- [ ] All three tiers are selectable
- [ ] Preservation add-on toggles correctly
- [ ] Billing cycle options appear when preservation is selected
- [ ] Discount checkbox works
- [ ] Discount type selection appears when discount is checked
- [ ] Price calculation updates in real-time
- [ ] Form validation works (required fields)
- [ ] Submit button shows loading state
- [ ] Success modal appears after submission
- [ ] Email notification is sent
- [ ] Admin authentication works
- [ ] Admin dashboard displays stats
- [ ] Request list shows all requests
- [ ] Request details show preservation add-on
- [ ] Request status can be updated
- [ ] Map loads memorials
- [ ] Memorial markers are clickable
- [ ] Memorial detail page loads
- [ ] Share functionality works

---

## 🎯 Success Criteria

✅ **All tiers are selectable and display correct pricing**
✅ **Preservation add-on works with monthly/yearly options**
✅ **Discount system applies 15% correctly**
✅ **Price calculation is accurate for all combinations**
✅ **Email notifications are sent with all required information**
✅ **Admin dashboard displays new fields**
✅ **Authentication works on all platforms**
✅ **No console errors during normal operation**

---

## 📞 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify the backend URL in `app.json`
3. Ensure all dependencies are installed: `npm install`
4. Clear cache and restart: `npm run dev -- --clear`

---

## 🎉 Happy Testing!

The tiered memorial service system is ready for comprehensive testing. Follow the scenarios above to verify all functionality works as expected.
