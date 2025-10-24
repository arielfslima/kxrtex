# KXRTEX - Comprehensive Testing Guide

**Version**: 1.0.0
**Last Updated**: October 24, 2025
**Status**: Ready for Testing

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Testing](#backend-testing)
3. [Web Testing](#web-testing)
4. [Mobile Testing](#mobile-testing)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Known Issues](#known-issues)

---

## Prerequisites

### Required Software
- ✅ Node.js 18+
- ✅ PostgreSQL 15+
- ✅ npm or yarn
- ✅ Git
- ✅ Postman or Insomnia (API testing)
- ✅ Expo Go app (mobile testing)

### Optional Tools
- Docker (for containerized testing)
- ngrok (for webhook testing)
- React Native Debugger
- Prisma Studio

### Environment Setup

1. **Clone repository**:
```bash
git clone <repository-url>
cd KXRTEX
```

2. **Setup backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run db:seed  # Load test data
```

3. **Setup web**:
```bash
cd web
npm install
cp .env.example .env
# Edit .env
```

4. **Setup mobile**:
```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your local IP
```

---

## Backend Testing

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3000
✅ Database connected
✅ Socket.IO initialized
```

### 2. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-24T...",
  "uptime": 123.456
}
```

### 3. Authentication Tests

#### Register Artista
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test Artist",
    "email": "artist@test.com",
    "senha": "senha123",
    "telefone": "11999999999",
    "cpfCnpj": "12345678901",
    "tipo": "ARTISTA",
    "nomeArtistico": "DJ Test",
    "categoria": "DJ",
    "subcategorias": ["House", "Techno"],
    "cidadesAtuacao": ["São Paulo", "Rio de Janeiro"],
    "valorBaseHora": 500
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "nome": "Test Artist",
    "email": "artist@test.com",
    "tipo": "ARTISTA",
    "artista": {
      "nomeArtistico": "DJ Test",
      "categoria": "DJ"
    }
  }
}
```

#### Register Contratante
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test Client",
    "email": "client@test.com",
    "senha": "senha123",
    "telefone": "11988888888",
    "cpfCnpj": "12345678000199",
    "tipo": "CONTRATANTE",
    "tipoPessoa": "FISICA"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@test.com",
    "senha": "senha123"
  }'
```

Save the token for authenticated requests.

#### Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Artist Tests

#### List Artists
```bash
curl "http://localhost:3000/api/artists?categoria=DJ&limit=10"
```

#### Get Artist Details
```bash
curl http://localhost:3000/api/artists/ARTIST_ID
```

#### Update Artist (authenticated)
```bash
curl -X PATCH http://localhost:3000/api/artists/ARTIST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio",
    "valorBaseHora": 600
  }'
```

### 5. Booking Tests

#### Create Booking (as Contratante)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer CONTRATANTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artistaId": "ARTIST_ID",
    "dataEvento": "2025-11-01",
    "horarioInicio": "20:00",
    "duracao": 4,
    "local": "Club XYZ, São Paulo",
    "descricaoEvento": "Underground party",
    "orcamento": 2000
  }'
```

#### List Bookings
```bash
curl http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Accept Booking (as Artista)
```bash
curl -X POST http://localhost:3000/api/bookings/BOOKING_ID/accept \
  -H "Authorization: Bearer ARTIST_TOKEN"
```

#### Create Counter Offer
```bash
curl -X POST http://localhost:3000/api/bookings/BOOKING_ID/counter-offer \
  -H "Authorization: Bearer ARTIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "valorProposto": 2500,
    "mensagem": "I can do it for this price"
  }'
```

### 6. Payment Tests (Sandbox)

#### Create PIX Payment
```bash
curl -X POST http://localhost:3000/api/payments/booking/BOOKING_ID \
  -H "Authorization: Bearer CONTRATANTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "billingType": "PIX"
  }'
```

Expected response includes:
- `pixQrCode`: Base64 QR code
- `pixCopyPaste`: PIX code to copy
- `paymentId`: ASAAS payment ID

#### Check Payment Status
```bash
curl http://localhost:3000/api/payments/booking/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Review Tests

#### Submit Review
```bash
curl -X POST http://localhost:3000/api/reviews/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profissionalismo": 5,
    "pontualidade": 5,
    "performance": 5,
    "comunicacao": 4,
    "condicoes": 5,
    "respeito": 5,
    "comentario": "Great artist!"
  }'
```

#### Get Artist Reviews
```bash
curl http://localhost:3000/api/reviews/artist/ARTIST_ID
```

### 8. Socket.IO Tests

Use a Socket.IO client or browser console:

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_TOKEN' }
});

// Join booking room
socket.emit('join-booking', { bookingId: 'BOOKING_ID' });

// Send message
socket.emit('new-message', {
  bookingId: 'BOOKING_ID',
  conteudo: 'Hello!'
});

// Listen for messages
socket.on('new-message', (message) => {
  console.log('New message:', message);
});

// Typing indicator
socket.emit('typing', { bookingId: 'BOOKING_ID' });
```

---

## Web Testing

### 1. Start Web Application

```bash
cd web
npm run dev
```

Open browser: http://localhost:5173

### 2. User Registration Flow

1. Click "Cadastrar"
2. Choose user type (ARTISTA or CONTRATANTE)
3. Fill form:
   - **Artista**: name, email, password, phone, CPF, artistic name, category, cities, pricing
   - **Contratante**: name, email, password, phone, CPF/CNPJ
4. Submit and verify redirect to /bookings

### 3. Login Flow

1. Go to /login
2. Enter credentials:
   - Email: `contratante@test.com`
   - Password: `senha123`
3. Verify redirect to /bookings
4. Check user info in header

### 4. Artist Search

1. Go to /artists
2. Test filters:
   - Category dropdown
   - City input
   - Price range sliders
   - Rating filter
3. Test sorting (relevance, price, rating)
4. Test pagination (load more)
5. Click artist card → verify redirect to /artists/:id

### 5. Artist Detail Page

1. Verify displays:
   - Profile photo
   - Name and category
   - Rating and reviews count
   - Bio
   - Pricing
   - Cities
   - Portfolio gallery
   - Social links
   - Reviews list
2. Click "Solicitar Booking" → verify redirect to /bookings/create

### 6. Create Booking

1. Fill booking form:
   - Select artist (if not pre-selected)
   - Event date (future date)
   - Start time
   - Duration (hours)
   - Location
   - Description
   - Budget
2. Submit
3. Verify redirect to /bookings
4. Check booking appears in list

### 7. Booking Management (Artista)

1. Login as artist
2. Go to /bookings
3. Click pending booking
4. Test actions:
   - **Accept**: Click "Aceitar" → verify status changes to ACEITO
   - **Reject**: Click "Recusar" → enter reason → verify status CANCELADO
   - **Counter Offer**: Click "Contra-proposta" → enter value and message → verify new proposal created

### 8. Payment Flow (Contratante)

1. Login as contratante
2. Go to booking with status ACEITO
3. Click "Realizar Pagamento"
4. Select PIX payment
5. Verify QR code displays
6. Verify copy-paste code works
7. Check status polling (should update when paid in sandbox)

### 9. Real-time Chat

1. Open booking detail in two browsers (artista + contratante)
2. Type message in one → verify appears in other
3. Test typing indicator (start typing → see "typing..." in other browser)
4. Test anti-circumvention:
   - Send phone: `(11) 99999-9999` → verify warning
   - Send email: `test@test.com` → verify warning
   - Send Instagram: `@instagram` → verify warning

### 10. Review Submission

1. Login after booking completion
2. Go to completed booking
3. Click "Avaliar"
4. Rate all 6 criteria (stars)
5. Add optional comment
6. Verify average calculation
7. Submit
8. Verify review appears on artist profile

### 11. Profile Management

1. Go to /profile
2. Verify displays user info
3. Click "Editar Perfil"
4. Upload profile photo:
   - Click photo area
   - Select image
   - Verify upload progress
   - Verify image updates
5. Edit fields (artist):
   - Artistic name
   - Bio
   - Pricing
   - Cities
6. Save changes
7. Verify updates persist

---

## Mobile Testing

### 1. Start Mobile App

```bash
cd mobile
npm start
```

Scan QR code with Expo Go app.

### 2. Welcome & Registration

1. Verify welcome screen displays
2. Tap "Começar"
3. Choose "Sou Artista" or "Sou Contratante"
4. Fill registration form
5. Submit and verify navigation to home

### 3. Login Flow

1. Tap "Já tenho conta"
2. Enter credentials
3. Verify auth token saves to AsyncStorage
4. Verify navigation to (tabs)/home

### 4. Artist Search (Home Tab)

1. Verify artist cards display
2. Test pull-to-refresh
3. Test category filter
4. Test sort options
5. Scroll to load more (pagination)
6. Tap artist card → verify navigation to /artist/[id]

### 5. Artist Detail

1. Verify all artist info displays
2. Swipe through portfolio images
3. Scroll to see reviews
4. Tap "Solicitar Booking" → verify navigation to /booking/create

### 6. Create Booking

1. Fill form (same as web)
2. Submit
3. Verify success alert
4. Verify navigation back
5. Verify booking appears in Bookings tab

### 7. Bookings Tab

1. Tap "Bookings" tab
2. Verify bookings list
3. Test status filter chips
4. Test pull-to-refresh
5. Tap booking → verify navigation to /booking/[id]

### 8. Booking Detail Actions

**As Artista:**
1. Pending booking:
   - Tap "Aceitar" → verify alert → confirm → verify status update
   - Tap "Recusar" → enter reason → submit → verify cancellation
   - Tap "Contra-proposta" → enter value → submit → verify proposal
2. Confirmed booking:
   - Tap "Abrir Chat" → verify chat opens
   - Tap "Fazer Check-in" → verify modal opens

**As Contratante:**
1. Accepted booking:
   - Tap "Realizar Pagamento" → verify payment screen

### 9. Payment (Mobile)

1. Select payment method (PIX)
2. Tap "Gerar QR Code"
3. Verify QR code displays
4. Tap "Copiar Código" → verify copied alert
5. Verify polling indicator shows
6. (In sandbox) Payment should auto-update

### 10. Chat

1. Open chat from booking detail
2. Type message → send
3. Verify message appears
4. Verify typing indicator works
5. Test with second device:
   - Send message from device A
   - Verify appears on device B in real-time

### 11. Check-in/Check-out

**Check-in:**
1. Tap "Fazer Check-in" on confirmed booking
2. Verify modal opens
3. Wait for location acquisition
4. Tap "Adicionar Foto"
5. Choose "Câmera" or "Galeria"
6. Take/select photo
7. Verify photo displays
8. Tap "Confirmar Check-in"
9. Verify success alert
10. Verify status changes to EM_ANDAMENTO

**Check-out:**
1. Tap "Fazer Check-out" on in-progress booking
2. Verify modal opens
3. Wait for location
4. Tap "Confirmar Check-out"
5. Verify success alert
6. Verify status changes to CONCLUIDO

### 12. Review (Mobile)

1. Open completed booking
2. Tap "Avaliar"
3. Tap stars to rate all 6 criteria
4. Add comment (optional)
5. Verify average displays
6. Tap "Enviar Avaliação"
7. Verify success alert
8. Verify navigation back

### 13. Profile Tab

1. Tap "Profile" tab
2. Verify user info displays
3. Tap "Editar Perfil" → verify edit screen
4. (Artista) Tap "Gerenciar Portfolio" → verify portfolio screen

### 14. Portfolio Management

1. Verify grid of images
2. Tap "Adicionar Imagens"
3. Select multiple images
4. Verify upload progress
5. Verify images appear in grid
6. Long press image → tap delete button
7. Confirm deletion
8. Verify image removed

### 15. Socket.IO Connection

1. Open app → verify auto-connect
2. Check React Native debugger console for:
   ```
   Socket connected
   Socket ID: xxx
   ```
3. Logout → verify disconnect
4. Login → verify reconnect

---

## Integration Testing

### End-to-End Booking Flow

**Scenario**: Complete booking from creation to review

**Participants**: 2 users (Contratante + Artista)

**Steps**:

1. **Contratante creates booking**:
   - Login as contratante@test.com
   - Search for artist
   - Create booking request
   - Verify booking appears as PENDENTE

2. **Artista accepts booking**:
   - Login as dj.nexus@test.com (or any artist)
   - View pending booking
   - Accept booking
   - Verify status → ACEITO
   - Verify contratante receives notification

3. **Contratante makes payment**:
   - Open accepted booking
   - Click payment
   - Generate PIX QR code
   - (Sandbox) Mark as paid in ASAAS dashboard
   - Verify webhook updates status → CONFIRMADO

4. **Real-time chat**:
   - Both users open chat
   - Exchange messages
   - Verify real-time delivery
   - Test typing indicators

5. **Artista check-in**:
   - On event day (or test date)
   - Open booking
   - Do check-in with photo
   - Verify location captured
   - Verify status → EM_ANDAMENTO

6. **Artista check-out**:
   - After event duration
   - Do check-out
   - Verify status → CONCLUIDO

7. **Both users review**:
   - Artista rates contratante
   - Contratante rates artista
   - Verify reviews appear on profiles

8. **Payment release** (after 48h):
   - Verify automatic payment release to artist
   - Check artist can withdraw funds

### Distance-Based Advance Payment

**Scenario**: Booking >200km triggers advance payment

**Steps**:

1. Create booking with distance >200km
2. Artist accepts
3. Verify `precisaAdiantamento` = true
4. Contratante pays full amount
5. Verify 50% held as advance
6. Artist does hotel check-in (tipo: HOTEL)
7. Verify advance payment released
8. Artist does event check-in (tipo: EVENTO)
9. Event completes
10. Verify remaining 50% released after 48h

### Anti-Circumvention Detection

**Scenario**: System detects contact sharing

**Test Cases**:
1. Send phone: `(11) 99999-9999` → System warning
2. Send email: `contact@test.com` → System warning
3. Send WhatsApp: `whatsapp me` → System warning
4. Send Instagram: `@myinstagram` → System warning
5. Send Telegram: `my telegram` → System warning

Verify:
- System message created
- Warning displayed in chat
- Message still sent (not blocked)

---

## Performance Testing

### Load Testing

Use tools like Apache JMeter or k6:

```javascript
// k6 load test example
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50, // 50 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:3000/api/artists');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```

### Metrics to Monitor

- Response time: < 200ms for API calls
- Socket.IO latency: < 100ms
- Image upload: < 3s for 2MB image
- Payment QR generation: < 2s
- Database queries: < 50ms average

### Frontend Performance

**Web:**
- Lighthouse score: >90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

**Mobile:**
- FPS: 60fps on scrolling
- Memory usage: < 100MB
- Bundle size: < 20MB

---

## Security Testing

### Authentication Tests

1. **Invalid credentials**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "wrong@test.com", "senha": "wrong"}'
   ```
   Expected: 401 Unauthorized

2. **Missing token**:
   ```bash
   curl http://localhost:3000/api/bookings
   ```
   Expected: 401 Unauthorized

3. **Invalid token**:
   ```bash
   curl http://localhost:3000/api/bookings \
     -H "Authorization: Bearer invalid_token"
   ```
   Expected: 401 Unauthorized

4. **Expired token**:
   - Wait 7 days (or modify JWT_EXPIRES_IN to 1s for testing)
   - Try request with old token
   - Expected: 401 Unauthorized

### Authorization Tests

1. **Artist trying contratante action**:
   ```bash
   # Artist token trying to create booking
   curl -X POST http://localhost:3000/api/bookings \
     -H "Authorization: Bearer ARTIST_TOKEN"
   ```
   Expected: 403 Forbidden

2. **Access other user's data**:
   ```bash
   # User A trying to update User B's profile
   curl -X PATCH http://localhost:3000/api/artists/OTHER_USER_ID \
     -H "Authorization: Bearer USER_A_TOKEN"
   ```
   Expected: 403 Forbidden

### Input Validation Tests

1. **SQL Injection**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@test.com OR 1=1", "senha": "x"}'
   ```
   Expected: 400 Bad Request (validation error)

2. **XSS Attack**:
   ```bash
   curl -X POST http://localhost:3000/api/bookings/BOOKING_ID/messages \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"conteudo": "<script>alert(1)</script>"}'
   ```
   Expected: Message saved but script escaped in frontend

3. **Invalid data types**:
   ```bash
   curl -X POST http://localhost:3000/api/bookings \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"artistaId": "not-a-uuid", "duracao": "not-a-number"}'
   ```
   Expected: 400 Bad Request with validation errors

### Rate Limiting Tests

```bash
# Send 100 requests rapidly
for i in {1..100}; do
  curl http://localhost:3000/api/artists
done
```

Expected: After ~60 requests, receive 429 Too Many Requests

---

## Known Issues

### Current Limitations

1. **Image Assets**:
   - App icons not yet created (placeholders needed)
   - Splash screen not designed
   - Solution: Follow guide in `mobile/assets/README.md`

2. **ASAAS Sandbox**:
   - Requires manual payment confirmation in sandbox
   - Webhooks need ngrok for local testing
   - Solution: Use ASAAS sandbox dashboard

3. **Cloudinary**:
   - Needs API credentials configured
   - Image uploads will fail without valid keys
   - Solution: Add CLOUDINARY_* to .env

4. **Push Notifications**:
   - Not yet implemented
   - Firebase configuration pending
   - Workaround: Use Socket.IO events

5. **Email Notifications**:
   - Not yet implemented
   - SendGrid configuration pending
   - Workaround: Check in-app notifications

### Minor Bugs

1. **Line Endings**:
   - Warning: LF vs CRLF on Windows
   - Non-breaking, can be ignored

2. **Peer Dependencies**:
   - expo-location required --legacy-peer-deps
   - Non-breaking, already handled

### Browser Compatibility

**Tested**:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

**Known Issues**:
- IE 11: Not supported (uses modern JS)
- Safari < 15: May have WebSocket issues

---

## Test Data Reference

### Test Users (from seed)

**Contratante**:
- Email: `contratante@test.com`
- Password: `senha123`
- Type: CONTRATANTE

**Artists (FREE tier)**:
- Email: `dj.underground@test.com`
- Email: `mc.flow@test.com`
- Password: `senha123`

**Artists (PLUS tier)**:
- Email: `dj.nexus@test.com`
- Email: `performer.eclipse@test.com`
- Password: `senha123`
- Verified: Yes

**Artists (PRO tier)**:
- Email: `dj.phoenix@test.com`
- Password: `senha123`
- Verified: Yes

### Test Booking Data

```json
{
  "dataEvento": "2025-11-15",
  "horarioInicio": "22:00",
  "duracao": 4,
  "local": "Club Underground, São Paulo, SP",
  "descricaoEvento": "Tech House party with underground vibes",
  "orcamento": 2000
}
```

---

## Reporting Issues

When reporting bugs, include:

1. **Environment**:
   - Platform (Backend/Web/Mobile)
   - OS and version
   - Browser/device

2. **Steps to reproduce**:
   - Exact sequence of actions
   - Input data used
   - Expected vs actual behavior

3. **Logs**:
   - Console errors
   - Network requests (if relevant)
   - Screenshots/videos

4. **Severity**:
   - Critical: System crash, data loss
   - High: Feature broken
   - Medium: Feature impaired
   - Low: Cosmetic issue

---

## Success Criteria

### MVP Acceptance

- [ ] All user registration flows work
- [ ] All authentication flows work
- [ ] Artist search returns results
- [ ] Booking creation succeeds
- [ ] Artist can accept/reject bookings
- [ ] Payment PIX QR code generates
- [ ] Real-time chat delivers messages
- [ ] Check-in captures location and photo
- [ ] Check-out updates status
- [ ] Reviews submit successfully
- [ ] Portfolio upload works
- [ ] Profile updates persist
- [ ] Socket.IO maintains connection
- [ ] No critical bugs
- [ ] Response times acceptable

### Production Readiness

- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Error handling comprehensive
- [ ] Documentation complete
- [ ] API credentials secured
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] SSL/TLS configured
- [ ] CDN configured (web)

---

**Next Steps**: After testing, proceed to deployment guides.

**Happy Testing! 🧪**
