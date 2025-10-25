# Testing the KXRTEX Notification System

**Version:** 1.0
**Date:** October 24, 2025
**System:** Push Notifications via Firebase Cloud Messaging

---

## Table of Contents

1. [Overview](#1-overview)
2. [Local Testing (Without Firebase)](#2-local-testing-without-firebase)
3. [Testing with Firebase](#3-testing-with-firebase)
4. [API Endpoint Testing](#4-api-endpoint-testing)
5. [Integration Testing](#5-integration-testing)
6. [Mobile App Testing](#6-mobile-app-testing)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Overview

### What Was Implemented

The notification system consists of:

1. **Backend Components:**
   - `notification.controller.js` - Device token management
   - `notification.service.js` - Firebase FCM integration
   - `notification.routes.js` - REST API endpoints
   - `DeviceToken` model - Database storage

2. **Features:**
   - Save/update FCM tokens per user
   - Remove tokens on logout
   - Send push notifications (single/multicast)
   - Pre-built notification templates
   - Platform-specific configuration (iOS/Android)
   - Graceful fallback without Firebase credentials

3. **API Endpoints:**
   - `POST /api/notifications/token` - Save device token
   - `DELETE /api/notifications/token` - Remove token
   - `GET /api/notifications/tokens` - List user's tokens (debug)

---

## 2. Local Testing (Without Firebase)

### Step 1: Verify Backend Is Running

```bash
cd backend

# Check if server is running
curl http://localhost:3000/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-10-24T...",
  "environment": "development"
}
```

### Step 2: Test Without Firebase Credentials

The notification system gracefully handles missing Firebase credentials:

```bash
# Start backend without FIREBASE_SERVICE_ACCOUNT
npm run dev

# You should see this warning in logs:
⚠️  Firebase credentials not configured. Push notifications will be disabled.

# Server should still work normally for all other features
```

### Step 3: Test Token Storage (Database Only)

Even without Firebase, you can test token storage:

```bash
# 1. Login to get auth token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contratante@test.com",
    "senha": "senha123"
  }'

# Save the token from response:
# TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Save a device token
curl -X POST http://localhost:3000/api/notifications/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "token": "test-fcm-token-123456789",
    "platform": "android"
  }'

# Expected response:
{
  "message": "Token salvo com sucesso",
  "data": {
    "id": "uuid-here",
    "usuarioId": "user-uuid",
    "token": "test-fcm-token-123456789",
    "platform": "android",
    "createdAt": "2025-10-24T...",
    "updatedAt": "2025-10-24T..."
  }
}

# 3. List user's tokens
curl -X GET http://localhost:3000/api/notifications/tokens \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
{
  "data": [
    {
      "id": "uuid-here",
      "platform": "android",
      "createdAt": "2025-10-24T...",
      "updatedAt": "2025-10-24T..."
    }
  ],
  "total": 1
}

# 4. Remove token
curl -X DELETE http://localhost:3000/api/notifications/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "token": "test-fcm-token-123456789"
  }'

# Expected response:
{
  "message": "Token removido com sucesso"
}
```

---

## 3. Testing with Firebase

### Step 1: Set Up Firebase Project

```bash
# 1. Go to https://console.firebase.google.com
# 2. Click "Add project"
# 3. Project name: "KXRTEX-Test" (or similar)
# 4. Disable Google Analytics (for testing)
# 5. Create project
```

### Step 2: Get Service Account Credentials

```bash
# 1. In Firebase Console, go to Project Settings (gear icon)
# 2. Click "Service accounts" tab
# 3. Click "Generate new private key"
# 4. Download the JSON file
# 5. Save as: backend/config/firebase-service-account.json
```

### Step 3: Configure Backend

```bash
cd backend

# Option 1: Use file path (for development)
echo 'FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json' >> .env

# Option 2: Use JSON string (for production)
# Copy entire JSON content and paste as single line:
# FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Restart backend
npm run dev

# You should see:
✅ Firebase Admin initialized successfully
```

### Step 4: Get a Real FCM Token (Mobile Device)

#### For Android:

```javascript
// In mobile app (mobile/app/_layout.jsx)
import * as Notifications from 'expo-notifications';

// Get token
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id'
});

console.log('FCM Token:', token.data);
// Example: ExponentPushToken[xxxxxxxxxxxxx]
```

#### For iOS:

```javascript
// Similar process, but requires APNs configuration in Firebase
// See: Firebase Console → Project Settings → Cloud Messaging → iOS
```

#### For Web (Testing):

```javascript
// You can use Firebase's web SDK to get a token
// Or use a test token for now
const testToken = "fake-fcm-token-for-testing-12345";
```

### Step 5: Save Real Token to Backend

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contratante@test.com","senha":"senha123"}' \
  | jq -r '.token')

# Save real FCM token
curl -X POST http://localhost:3000/api/notifications/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "token": "ExponentPushToken[your-real-token-here]",
    "platform": "android"
  }'
```

### Step 6: Send Test Notification

You can test sending notifications directly via the service:

```javascript
// Create test script: backend/scripts/test-notification.js
import { sendPushNotification } from '../src/services/notification.service.js';

async function test() {
  const token = 'ExponentPushToken[your-token-here]';

  const notification = {
    title: '🎵 Teste de Notificação',
    body: 'Se você recebeu isso, as notificações estão funcionando!'
  };

  const data = {
    type: 'TEST',
    screen: 'Home'
  };

  try {
    const result = await sendPushNotification(token, notification, data);
    console.log('✅ Notification sent:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
```

```bash
# Run test
cd backend
node scripts/test-notification.js

# If successful, you should see the notification on your device!
```

---

## 4. API Endpoint Testing

### Using cURL

#### Save Token
```bash
curl -X POST http://localhost:3000/api/notifications/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "fcm-token-here",
    "platform": "android"
  }'
```

#### Remove Token
```bash
curl -X DELETE http://localhost:3000/api/notifications/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "fcm-token-here"
  }'
```

#### List Tokens (Debug)
```bash
curl -X GET http://localhost:3000/api/notifications/tokens \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman/Thunder Client

#### Collection Setup

Create a new collection "KXRTEX Notifications" with these requests:

**1. Login (to get token)**
```
POST http://localhost:3000/api/auth/login
Headers:
  Content-Type: application/json
Body:
{
  "email": "contratante@test.com",
  "senha": "senha123"
}
```

**2. Save Device Token**
```
POST http://localhost:3000/api/notifications/token
Headers:
  Content-Type: application/json
  Authorization: Bearer {{token}}
Body:
{
  "token": "test-fcm-token-123",
  "platform": "android"
}
```

**3. List Tokens**
```
GET http://localhost:3000/api/notifications/tokens
Headers:
  Authorization: Bearer {{token}}
```

**4. Remove Token**
```
DELETE http://localhost:3000/api/notifications/token
Headers:
  Content-Type: application/json
  Authorization: Bearer {{token}}
Body:
{
  "token": "test-fcm-token-123"
}
```

### Expected Responses

#### Success (201/200)
```json
{
  "message": "Token salvo com sucesso",
  "data": {
    "id": "uuid",
    "usuarioId": "user-uuid",
    "token": "fcm-token",
    "platform": "android",
    "createdAt": "2025-10-24T...",
    "updatedAt": "2025-10-24T..."
  }
}
```

#### Error - Missing Token (400)
```json
{
  "error": "Token é obrigatório"
}
```

#### Error - Invalid Platform (400)
```json
{
  "error": "Platform inválida. Use: ios, android ou web"
}
```

#### Error - Unauthorized (401)
```json
{
  "error": "Token inválido ou expirado"
}
```

---

## 5. Integration Testing

### Test Notification Flow in Booking Process

#### Scenario: New Booking Request

```bash
# 1. Login as Contratante
CONTRATANTE_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contratante@test.com","senha":"senha123"}' \
  | jq -r '.token')

# 2. Login as Artista
ARTISTA_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dj.underground@test.com","senha":"senha123"}' \
  | jq -r '.token')

# 3. Save Artista's FCM token
curl -X POST http://localhost:3000/api/notifications/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARTISTA_TOKEN" \
  -d '{
    "token": "artista-fcm-token-real",
    "platform": "android"
  }'

# 4. Contratante creates booking
# (This should trigger notification to artista)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONTRATANTE_TOKEN" \
  -d '{
    "artistaId": "artista-uuid-here",
    "dataEvento": "2025-12-15",
    "horaInicio": "22:00",
    "horaFim": "04:00",
    "localEndereco": "Rua Teste, 123",
    "localCidade": "São Paulo",
    "descricao": "Teste de notificação",
    "valorProposto": 1000
  }'

# 5. Check backend logs for notification sent:
# ✅ Push notification sent successfully: projects/...
```

### Verify Notification Was Sent

Check Firebase Console:
```
1. Go to Firebase Console
2. Click "Cloud Messaging"
3. Click "Sent" tab
4. You should see the notification in the list
```

---

## 6. Mobile App Testing

### Step 1: Request Permissions (iOS)

```javascript
// mobile/app/_layout.jsx
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.requestPermissionsAsync();
if (status !== 'granted') {
  alert('Precisamos de permissão para enviar notificações');
}
```

### Step 2: Get FCM Token

```javascript
// mobile/src/services/notifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

export const registerForPushNotifications = async () => {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return null;
    }

    // Get token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id'
    });

    const token = tokenData.data;
    const platform = Platform.OS;

    // Save to backend
    await api.post('/notifications/token', { token, platform });

    console.log('✅ FCM token registered:', token);
    return token;
  } catch (error) {
    console.error('❌ Error registering for notifications:', error);
    return null;
  }
};
```

### Step 3: Handle Incoming Notifications

```javascript
// mobile/app/_layout.jsx
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Handle notification received while app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    // Handle notification tap
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('👆 Notification tapped:', data);

      // Navigate based on notification data
      if (data.screen === 'BookingDetail') {
        router.push(`/booking/${data.bookingId}`);
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // ... rest of layout
}
```

### Step 4: Test on Physical Device

```bash
# 1. Start Expo dev server
cd mobile
npm start

# 2. Scan QR code with Expo Go app (Android) or Camera (iOS)

# 3. Login to the app

# 4. Token should be automatically registered

# 5. Trigger a notification from backend

# 6. Notification should appear on device!
```

---

## 7. Troubleshooting

### Problem: "Firebase not initialized"

**Solution:**
```bash
# Check .env file
cat backend/.env | grep FIREBASE

# Should have:
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
# OR
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Restart backend
npm run dev
```

### Problem: "Invalid token" error from Firebase

**Solution:**
```bash
# FCM tokens expire or become invalid
# Re-register the token from mobile app

# Or test with a fresh token:
# 1. Uninstall app
# 2. Reinstall
# 3. Login again
# 4. Token will be re-registered
```

### Problem: Notification not received on iOS

**Solution:**
```bash
# iOS requires APNs configuration
# 1. Get APNs key from Apple Developer
# 2. Upload to Firebase Console → Cloud Messaging → iOS
# 3. Rebuild app with updated Firebase config
```

### Problem: "Token already exists" but notification still not sent

**Solution:**
```bash
# Check if multiple tokens exist for user
curl -X GET http://localhost:3000/api/notifications/tokens \
  -H "Authorization: Bearer $TOKEN"

# If multiple tokens, Firebase sends to all
# If one is invalid, it may fail silently
# Remove old tokens:
curl -X DELETE http://localhost:3000/api/notifications/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"token":"old-token-here"}'
```

### Problem: Backend logs show "Firebase not configured"

**Solution:**
```bash
# This is expected if you haven't set up Firebase yet
# The system gracefully handles this
# All other features work normally
# Just notifications won't be sent

# To enable notifications:
# 1. Create Firebase project
# 2. Download service account JSON
# 3. Add to .env
# 4. Restart backend
```

### Debug Mode

Enable detailed logging:

```javascript
// backend/src/services/notification.service.js
// Already has console.log statements

// Check logs when sending:
✅ Push notification sent successfully: projects/...
✅ Sent 2/3 notifications (if multicast)

// Or errors:
❌ Error sending push notification: [error details]
```

---

## Testing Checklist

### Backend Tests
- [ ] Server starts without Firebase (graceful degradation)
- [ ] Server starts with Firebase credentials
- [ ] Can save device token (authenticated)
- [ ] Cannot save token (unauthenticated) - returns 401
- [ ] Cannot save token without platform - returns 400
- [ ] Can list user's tokens
- [ ] Can remove device token
- [ ] Removing non-existent token doesn't error

### Integration Tests
- [ ] Creating booking triggers notification to artist
- [ ] Accepting booking triggers notification to contratante
- [ ] Payment confirmation triggers notification
- [ ] New chat message triggers notification
- [ ] Check-in reminder triggers notification
- [ ] Review reminder triggers notification

### Mobile Tests
- [ ] App requests notification permissions
- [ ] FCM token is obtained successfully
- [ ] Token is saved to backend on login
- [ ] Token is removed on logout
- [ ] Notification appears in system tray
- [ ] Tapping notification opens correct screen
- [ ] Notification sound plays
- [ ] Badge count updates

### Production Tests
- [ ] Notifications work in production environment
- [ ] Multiple devices per user receive notifications
- [ ] iOS notifications work (requires APNs)
- [ ] Android notifications work
- [ ] Web notifications work (if implemented)

---

## Next Steps

1. **Complete Firebase Setup** - Get production credentials
2. **Test on Real Devices** - iOS and Android
3. **Integrate Throughout App** - Add notification calls to all relevant events
4. **Monitor Performance** - Check Firebase Console for delivery rates
5. **Handle Edge Cases** - Token refresh, expired tokens, etc.

---

**Document Version:** 1.0
**Last Updated:** October 24, 2025
**Status:** ✅ Ready for Testing

**Prepared by:** Claude Code
