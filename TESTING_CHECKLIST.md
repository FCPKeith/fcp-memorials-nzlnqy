
# FCP Memorials - Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Backend is running at: https://zx9m4wtvay3c52kkt4rane79tkz3gpu2.app.specular.dev
- [ ] App is running: `npm run dev`
- [ ] Backend has sample memorial data seeded
- [ ] Better Auth is configured on backend

## 🌐 Public Features Testing

### Map Screen
- [ ] Map loads successfully
- [ ] Memorial markers appear on map
- [ ] Tap marker navigates to memorial detail
- [ ] Map shows correct number of memorials
- [ ] Error handling works (disconnect network and retry)

### Memorial Detail Screen
- [ ] Memorial loads by public URL
- [ ] All fields display correctly (name, dates, story, photos)
- [ ] Photos display in gallery
- [ ] QR code displays
- [ ] Share button works
- [ ] Back navigation works
- [ ] Error modal shows for invalid memorial ID

### QR Scanner
- [ ] Camera permission request works
- [ ] QR code scanning works
- [ ] Valid QR code navigates to memorial
- [ ] Invalid QR code shows error modal
- [ ] "Scan Again" button works
- [ ] Scanner works on iOS, Android, and Web

### Memorial Request Form
- [ ] Form loads successfully
- [ ] All input fields work
- [ ] Tier selection works (Basic/Standard/Premium)
- [ ] Price calculation is correct
- [ ] Discount checkbox works
- [ ] Discount type selection works (Military/First Responder)
- [ ] Price updates with discount (15% off)
- [ ] Form validation works (required fields)
- [ ] Submit button shows loading state
- [ ] Success modal shows after submission
- [ ] Request ID is displayed
- [ ] Error modal shows on failure

## 🔐 Authentication Testing

### Sign Up
- [ ] Sign up form loads
- [ ] Email/password sign up works
- [ ] Validation works (email format, password strength)
- [ ] Success redirects to admin dashboard
- [ ] Error messages display correctly

### Sign In
- [ ] Sign in form loads
- [ ] Email/password sign in works
- [ ] "Remember me" works
- [ ] Success redirects to admin dashboard
- [ ] Error messages display correctly
- [ ] Invalid credentials show error

### OAuth (Google/Apple)
- [ ] Google sign in button appears
- [ ] Apple sign in button appears
- [ ] OAuth popup opens correctly (web)
- [ ] OAuth callback works
- [ ] User is redirected after OAuth success

### Session Persistence
- [ ] User stays logged in after app reload
- [ ] Token is stored securely
- [ ] Session expires correctly
- [ ] Logout clears session

## 🔒 Admin Features Testing

### Admin Dashboard
- [ ] Dashboard loads after login
- [ ] Statistics display correctly
- [ ] Total requests count is accurate
- [ ] Status breakdown is correct (submitted, under_review, etc.)
- [ ] "View All Requests" button works
- [ ] "Sign Out" button works

### Memorial Requests Management
- [ ] Requests list loads
- [ ] All requests display correctly
- [ ] Request cards show all details
- [ ] Tap request opens status modal
- [ ] Status update buttons work:
  - [ ] Under Review
  - [ ] Approve
  - [ ] Reject
- [ ] Status updates immediately
- [ ] Error handling works

### Protected Routes
- [ ] Admin routes redirect to /auth when not logged in
- [ ] Admin routes accessible when logged in
- [ ] Logout redirects to /auth

## 🎨 UI/UX Testing

### Custom Modal
- [ ] Modal appears correctly
- [ ] Modal overlay dims background
- [ ] Modal closes on overlay tap
- [ ] Modal closes on button press
- [ ] Modal buttons work correctly
- [ ] Modal works on web (no Alert.alert)

### Loading States
- [ ] Loading indicators show during API calls
- [ ] Loading text displays
- [ ] UI is disabled during loading
- [ ] Loading state clears after completion

### Error Handling
- [ ] Error modals display correctly
- [ ] Error messages are user-friendly
- [ ] Retry buttons work
- [ ] Console logs errors for debugging
- [ ] Network errors handled gracefully

### Navigation
- [ ] Tab bar works (Scanner, Map, Request)
- [ ] Tab bar highlights active tab
- [ ] Navigation between screens works
- [ ] Back button works
- [ ] Deep linking works (memorial URLs)

## 📱 Cross-Platform Testing

### iOS
- [ ] App runs on iOS simulator
- [ ] Camera permission works
- [ ] QR scanning works
- [ ] OAuth works (Apple Sign In)
- [ ] SecureStore works
- [ ] Navigation works

### Android
- [ ] App runs on Android emulator
- [ ] Camera permission works
- [ ] QR scanning works
- [ ] OAuth works (Google Sign In)
- [ ] SecureStore works
- [ ] Navigation works

### Web
- [ ] App runs in browser
- [ ] Camera permission works (if supported)
- [ ] QR scanning works (if supported)
- [ ] OAuth popup works
- [ ] localStorage works
- [ ] Navigation works
- [ ] Responsive design works

## 🔌 API Integration Testing

### Public Endpoints
- [ ] GET /api/memorials/by-url/:publicUrl works
- [ ] GET /api/memorials/map works
- [ ] POST /api/memorial-requests works
- [ ] POST /api/upload/media works (if implemented)

### Admin Endpoints
- [ ] GET /api/admin/memorial-requests works
- [ ] PUT /api/admin/memorial-requests/:id works
- [ ] Bearer token is sent correctly
- [ ] 401 errors handled (redirect to login)

### Error Scenarios
- [ ] 404 errors handled
- [ ] 500 errors handled
- [ ] Network timeout handled
- [ ] Invalid JSON handled
- [ ] CORS errors handled (if applicable)

## 🐛 Edge Cases

### Empty States
- [ ] Map with no memorials shows message
- [ ] Requests list with no requests shows message
- [ ] Memorial with no photos handled

### Invalid Data
- [ ] Invalid memorial ID shows error
- [ ] Invalid QR code shows error
- [ ] Invalid form data shows validation errors
- [ ] Missing required fields prevented

### Network Issues
- [ ] Offline mode handled
- [ ] Slow network shows loading
- [ ] Network error shows retry option
- [ ] Timeout handled gracefully

## 📊 Performance Testing

- [ ] Map loads in under 2 seconds
- [ ] Memorial detail loads in under 2 seconds
- [ ] QR scan navigates in under 2 seconds
- [ ] Form submission completes in under 5 seconds
- [ ] No memory leaks
- [ ] No excessive re-renders

## 🔒 Security Testing

- [ ] Bearer token stored securely
- [ ] Token not exposed in logs
- [ ] Admin routes protected
- [ ] HTTPS used for all API calls
- [ ] No sensitive data in URLs

## 📝 Final Checks

- [ ] All console errors resolved
- [ ] All console warnings resolved
- [ ] No TODO comments remaining
- [ ] Code is properly formatted
- [ ] Documentation is complete
- [ ] Test data is available

## 🎯 Success Criteria

- [ ] QR scan opens memorial in under 2 seconds ✅
- [ ] Request a memorial in under 5 minutes ✅
- [ ] Memorials feel reverent, not commercial ✅
- [ ] No ads, no selling personal data ✅
- [ ] Clear consent for submissions ✅
- [ ] Admin retains editorial control ✅

---

## 📋 Test Results

**Date**: _______________
**Tester**: _______________
**Platform**: iOS / Android / Web
**Result**: Pass / Fail

**Notes**:
_______________________________________
_______________________________________
_______________________________________

**Issues Found**:
1. _______________________________________
2. _______________________________________
3. _______________________________________

**Overall Status**: ✅ Ready / ⚠️ Needs Work / ❌ Blocked

---

**Complete this checklist before deploying to production! 🚀**
