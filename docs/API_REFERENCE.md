# KXRTEX API Reference

**Version**: 1.0.0
**Base URL**: `http://localhost:3000/api` (development)
**Production URL**: `https://api.kxrtex.com/api`

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register User

**POST** `/auth/register`

Creates a new user account (ARTISTA or CONTRATANTE).

**Request Body** (Artista):
```json
{
  "nome": "DJ Test",
  "email": "dj@example.com",
  "senha": "senha123",
  "telefone": "11999999999",
  "cpfCnpj": "12345678901",
  "tipo": "ARTISTA",
  "nomeArtistico": "DJ Test",
  "categoria": "DJ",
  "subcategorias": ["House", "Techno"],
  "cidadesAtuacao": ["São Paulo", "Rio de Janeiro"],
  "valorBaseHora": 500,
  "bio": "Professional DJ with 10 years experience",
  "instagram": "@djtest",
  "facebook": "facebook.com/djtest",
  "youtube": "youtube.com/@djtest"
}
```

**Request Body** (Contratante):
```json
{
  "nome": "John Doe",
  "email": "john@example.com",
  "senha": "senha123",
  "telefone": "11988888888",
  "cpfCnpj": "12345678000199",
  "tipo": "CONTRATANTE",
  "tipoPessoa": "FISICA"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "DJ Test",
    "email": "dj@example.com",
    "telefone": "11999999999",
    "tipo": "ARTISTA",
    "foto": null,
    "artista": {
      "id": "uuid",
      "nomeArtistico": "DJ Test",
      "categoria": "DJ",
      "subcategorias": ["House", "Techno"],
      "plano": "FREE",
      "notaMedia": null,
      "totalBookings": 0
    }
  }
}
```

**Errors**:
- `400`: Validation error (missing fields, invalid email, etc.)
- `409`: Email already registered

---

### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "dj@example.com",
  "senha": "senha123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "DJ Test",
    "email": "dj@example.com",
    "tipo": "ARTISTA",
    "artista": {
      "nomeArtistico": "DJ Test",
      "categoria": "DJ",
      "plano": "FREE"
    }
  }
}
```

**Errors**:
- `400`: Invalid credentials
- `404`: User not found

---

### Get Current User

**GET** `/auth/me`

Get authenticated user details.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "uuid",
  "nome": "DJ Test",
  "email": "dj@example.com",
  "telefone": "11999999999",
  "tipo": "ARTISTA",
  "foto": "https://res.cloudinary.com/...",
  "artista": {
    "id": "uuid",
    "nomeArtistico": "DJ Test",
    "categoria": "DJ",
    "subcategorias": ["House", "Techno"],
    "cidadesAtuacao": ["São Paulo"],
    "valorBaseHora": 500,
    "plano": "FREE",
    "notaMedia": 4.8,
    "totalBookings": 15,
    "portfolio": ["url1", "url2"],
    "bio": "Professional DJ...",
    "statusVerificacao": "PENDENTE"
  }
}
```

**Errors**:
- `401`: Unauthorized (invalid/missing token)

---

## Artists

### List Artists

**GET** `/artists`

Search and filter artists.

**Query Parameters**:
- `categoria`: Filter by category (DJ, MC, PERFORMER)
- `subcategoria`: Filter by subcategory
- `cidade`: Filter by city
- `precoMin`: Minimum price per hour
- `precoMax`: Maximum price per hour
- `avaliacaoMin`: Minimum rating (1-5)
- `ordenacao`: Sort order (relevancia, preco_asc, preco_desc, avaliacao)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)

**Example**:
```
GET /artists?categoria=DJ&cidade=São Paulo&precoMax=1000&ordenacao=avaliacao&page=1&limit=10
```

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "nomeArtistico": "DJ Test",
      "usuario": {
        "nome": "DJ Test",
        "foto": "https://..."
      },
      "categoria": "DJ",
      "subcategorias": ["House", "Techno"],
      "cidadesAtuacao": ["São Paulo"],
      "valorBaseHora": 500,
      "plano": "PLUS",
      "notaMedia": 4.8,
      "totalBookings": 15,
      "statusVerificacao": "APROVADO"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### Get Artist Details

**GET** `/artists/:id`

Get detailed artist profile.

**Response** (200):
```json
{
  "id": "uuid",
  "nomeArtistico": "DJ Test",
  "usuario": {
    "id": "uuid",
    "nome": "DJ Test",
    "foto": "https://...",
    "email": "dj@example.com"
  },
  "categoria": "DJ",
  "subcategorias": ["House", "Techno"],
  "cidadesAtuacao": ["São Paulo", "Rio de Janeiro"],
  "valorBaseHora": 500,
  "plano": "PLUS",
  "notaMedia": 4.8,
  "totalBookings": 15,
  "portfolio": [
    "https://res.cloudinary.com/image1.jpg",
    "https://res.cloudinary.com/image2.jpg"
  ],
  "bio": "Professional DJ with 10 years experience...",
  "instagram": "@djtest",
  "facebook": "facebook.com/djtest",
  "youtube": "youtube.com/@djtest",
  "statusVerificacao": "APROVADO",
  "avaliacoes": [
    {
      "id": "uuid",
      "notaGeral": 5,
      "comentario": "Amazing performance!",
      "avaliador": {
        "nome": "John Doe"
      },
      "criadoEm": "2025-10-20T..."
    }
  ]
}
```

**Errors**:
- `404`: Artist not found

---

### Update Artist

**PATCH** `/artists/:id`

Update artist profile (authenticated, artist only).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (partial update):
```json
{
  "bio": "Updated bio text",
  "valorBaseHora": 600,
  "cidadesAtuacao": ["São Paulo", "Rio de Janeiro", "Curitiba"],
  "subcategorias": ["House", "Techno", "Trance"]
}
```

**Response** (200):
```json
{
  "message": "Artist updated successfully",
  "data": {
    "id": "uuid",
    "nomeArtistico": "DJ Test",
    "bio": "Updated bio text",
    "valorBaseHora": 600
  }
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Forbidden (not the artist owner)
- `404`: Artist not found

---

## Bookings

### Create Booking

**POST** `/bookings`

Create a booking request (contratante only).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "artistaId": "uuid",
  "dataEvento": "2025-11-15",
  "horarioInicio": "22:00",
  "duracao": 4,
  "local": "Club XYZ, São Paulo, SP",
  "descricaoEvento": "Tech House party",
  "orcamento": 2000
}
```

**Response** (201):
```json
{
  "message": "Booking created successfully",
  "data": {
    "id": "uuid",
    "artistaId": "uuid",
    "contratanteId": "uuid",
    "dataEvento": "2025-11-15T00:00:00.000Z",
    "horarioInicio": "22:00",
    "duracao": 4,
    "local": "Club XYZ, São Paulo, SP",
    "descricaoEvento": "Tech House party",
    "status": "PENDENTE",
    "valorArtista": 2000,
    "taxaPlataforma": 300,
    "valorTotal": 2300,
    "precisaAdiantamento": false,
    "distanciaKm": null,
    "propostas": [
      {
        "id": "uuid",
        "tipo": "INICIAL",
        "valorProposto": 2000,
        "status": "PENDENTE"
      }
    ]
  }
}
```

**Errors**:
- `400`: Validation error, invalid date, artist not available
- `401`: Unauthorized
- `403`: Forbidden (not a contratante)
- `404`: Artist not found

---

### List Bookings

**GET** `/bookings`

List user's bookings (filtered by user type).

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status`: Filter by status (PENDENTE, ACEITO, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO)
- `page`: Page number
- `limit`: Results per page

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "artista": {
        "nomeArtistico": "DJ Test",
        "usuario": {
          "foto": "https://..."
        }
      },
      "contratante": {
        "usuario": {
          "nome": "John Doe"
        }
      },
      "dataEvento": "2025-11-15T00:00:00.000Z",
      "horarioInicio": "22:00",
      "local": "Club XYZ",
      "status": "PENDENTE",
      "valorTotal": 2300
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

### Get Booking Details

**GET** `/bookings/:id`

Get detailed booking information.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "uuid",
  "artista": {
    "id": "uuid",
    "nomeArtistico": "DJ Test",
    "categoria": "DJ",
    "usuario": {
      "nome": "DJ Test",
      "foto": "https://...",
      "telefone": "11999999999"
    }
  },
  "contratante": {
    "id": "uuid",
    "usuario": {
      "nome": "John Doe",
      "foto": "https://...",
      "telefone": "11988888888"
    }
  },
  "dataEvento": "2025-11-15T00:00:00.000Z",
  "horarioInicio": "22:00",
  "duracao": 4,
  "local": "Club XYZ, São Paulo, SP",
  "descricaoEvento": "Tech House party",
  "status": "CONFIRMADO",
  "valorArtista": 2000,
  "taxaPlataforma": 300,
  "valorTotal": 2300,
  "precisaAdiantamento": false,
  "checkInArtista": "2025-11-15T21:45:00.000Z",
  "checkOutArtista": null,
  "propostas": [
    {
      "id": "uuid",
      "tipo": "INICIAL",
      "valorProposto": 2000,
      "status": "ACEITO",
      "mensagem": null,
      "criadoEm": "2025-10-24T..."
    }
  ],
  "mensagens": [
    {
      "id": "uuid",
      "conteudo": "Hello!",
      "tipo": "USER",
      "remetenteId": "uuid",
      "criadoEm": "2025-10-24T..."
    }
  ],
  "pagamento": {
    "id": "uuid",
    "valor": 2300,
    "status": "CONFIRMED",
    "pixQrCode": "data:image/png;base64,...",
    "asaasPaymentId": "pay_xxx"
  }
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Forbidden (not participant in booking)
- `404`: Booking not found

---

### Accept Booking

**POST** `/bookings/:id/accept`

Artist accepts booking.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Booking accepted successfully",
  "data": {
    "id": "uuid",
    "status": "ACEITO",
    "valorArtista": 2000,
    "taxaPlataforma": 300,
    "valorTotal": 2300
  }
}
```

**Errors**:
- `400`: Invalid booking status
- `401`: Unauthorized
- `403`: Forbidden (not the artist)
- `404`: Booking not found

---

### Reject Booking

**POST** `/bookings/:id/reject`

Artist rejects booking with reason.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "motivo": "Not available on that date"
}
```

**Response** (200):
```json
{
  "message": "Booking rejected",
  "data": {
    "id": "uuid",
    "status": "CANCELADO",
    "motivoCancelamento": "Not available on that date"
  }
}
```

---

### Counter Offer

**POST** `/bookings/:id/counter-offer`

Artist sends counter-offer.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "valorProposto": 2500,
  "mensagem": "I can do it for this price with extended set"
}
```

**Response** (201):
```json
{
  "message": "Counter offer created",
  "data": {
    "id": "uuid",
    "tipo": "CONTRA",
    "valorProposto": 2500,
    "mensagem": "I can do it for this price with extended set",
    "status": "PENDENTE"
  }
}
```

---

## Payments

### Create Payment

**POST** `/payments/booking/:bookingId`

Create payment for accepted booking.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (PIX):
```json
{
  "billingType": "PIX"
}
```

**Request Body** (Credit Card):
```json
{
  "billingType": "CREDIT_CARD",
  "creditCard": {
    "holderName": "John Doe",
    "number": "5162306219378829",
    "expiryMonth": "05",
    "expiryYear": "2028",
    "ccv": "318"
  },
  "creditCardHolderInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "cpfCnpj": "12345678901",
    "postalCode": "01310-100",
    "addressNumber": "1000"
  }
}
```

**Response** (201 - PIX):
```json
{
  "message": "Payment created successfully",
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "valor": 2300,
    "status": "PENDING",
    "billingType": "PIX",
    "asaasPaymentId": "pay_xxx",
    "pixQrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "pixCopyPaste": "00020126580014br.gov.bcb.pix..."
  }
}
```

**Errors**:
- `400`: Booking not in ACEITO status, payment already exists
- `401`: Unauthorized
- `403`: Forbidden (not the contratante)
- `404`: Booking not found
- `500`: ASAAS API error

---

### Get Payment Status

**GET** `/payments/booking/:bookingId`

Get payment details and status.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "valor": 2300,
  "status": "CONFIRMED",
  "billingType": "PIX",
  "asaasPaymentId": "pay_xxx",
  "pixQrCode": "data:image/png;base64,...",
  "criadoEm": "2025-10-24T...",
  "atualizadoEm": "2025-10-24T..."
}
```

---

### Release Payment

**POST** `/payments/booking/:bookingId/release`

Manually release payment to artist (48h after event).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Payment released to artist",
  "data": {
    "id": "uuid",
    "status": "RELEASED"
  }
}
```

---

## Chat

### Get Chat History

**GET** `/chat/:bookingId`

Get all messages for a booking.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit`: Number of messages (default: 50)
- `before`: Cursor for pagination (message ID)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "conteudo": "Hello, looking forward to the event!",
      "tipo": "USER",
      "remetenteId": "uuid",
      "remetente": {
        "nome": "DJ Test",
        "foto": "https://..."
      },
      "criadoEm": "2025-10-24T..."
    },
    {
      "id": "uuid",
      "conteudo": "⚠️ Aviso: Foi detectada tentativa de compartilhamento de contato (telefone)",
      "tipo": "SISTEMA",
      "criadoEm": "2025-10-24T..."
    }
  ],
  "pagination": {
    "hasMore": false,
    "nextCursor": null
  }
}
```

---

### Send Message

**POST** `/chat/:bookingId`

Send message in booking chat.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "conteudo": "See you at the event!"
}
```

**Response** (201):
```json
{
  "message": "Message sent",
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "conteudo": "See you at the event!",
    "tipo": "USER",
    "remetenteId": "uuid",
    "criadoEm": "2025-10-24T..."
  },
  "warning": null
}
```

**Response with Anti-Circumvention Warning**:
```json
{
  "message": "Message sent with warning",
  "data": {
    "id": "uuid",
    "conteudo": "My phone is (11) 99999-9999",
    "tipo": "USER",
    "criadoEm": "2025-10-24T..."
  },
  "warning": {
    "type": "TELEFONE",
    "message": "Foi detectada tentativa de compartilhamento de contato"
  }
}
```

---

## Reviews

### Submit Review

**POST** `/reviews/:bookingId`

Submit review for completed booking.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "profissionalismo": 5,
  "pontualidade": 5,
  "performance": 5,
  "comunicacao": 4,
  "condicoes": 5,
  "respeito": 5,
  "comentario": "Amazing performance! Highly recommended!"
}
```

**Response** (201):
```json
{
  "message": "Review submitted successfully",
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "avaliadorId": "uuid",
    "avaliadoId": "uuid",
    "profissionalismo": 5,
    "pontualidade": 5,
    "performance": 5,
    "comunicacao": 4,
    "condicoes": 5,
    "respeito": 5,
    "notaGeral": 4.83,
    "comentario": "Amazing performance!",
    "criadoEm": "2025-10-24T..."
  }
}
```

**Errors**:
- `400`: Booking not completed, already reviewed
- `401`: Unauthorized
- `404`: Booking not found

---

### Get Artist Reviews

**GET** `/reviews/artist/:artistaId`

Get all reviews for an artist.

**Query Parameters**:
- `page`: Page number
- `limit`: Results per page

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "notaGeral": 4.83,
      "profissionalismo": 5,
      "pontualidade": 5,
      "performance": 5,
      "comunicacao": 4,
      "condicoes": 5,
      "respeito": 5,
      "comentario": "Amazing performance!",
      "avaliador": {
        "nome": "John Doe",
        "foto": "https://..."
      },
      "criadoEm": "2025-10-24T..."
    }
  ],
  "stats": {
    "mediaGeral": 4.75,
    "totalAvaliacoes": 15
  },
  "pagination": {
    "page": 1,
    "total": 15
  }
}
```

---

## Check-in/Check-out

### Check-in

**POST** `/bookings/:bookingId/checkin`

Artist check-in at event location.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
- `latitude`: number (required)
- `longitude`: number (required)
- `file`: image file (required)

**Response** (200):
```json
{
  "message": "Check-in successful",
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "tipo": "EVENTO",
    "latitude": -23.550520,
    "longitude": -46.633308,
    "fotoComprovante": "https://res.cloudinary.com/...",
    "timestamp": "2025-11-15T21:45:00.000Z"
  }
}
```

**Errors**:
- `400`: Missing location/photo, invalid time window, already checked in
- `401`: Unauthorized
- `403`: Forbidden (not the artist)

---

### Check-out

**POST** `/bookings/:bookingId/checkout`

Artist check-out after event.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "latitude": -23.550520,
  "longitude": -46.633308
}
```

**Response** (200):
```json
{
  "message": "Check-out successful",
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "checkOutArtista": "2025-11-16T02:15:00.000Z",
    "status": "CONCLUIDO"
  }
}
```

---

## Upload

### Upload Profile Photo

**POST** `/upload/profile-photo`

Upload user profile photo.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
- `file`: image file (required, max 5MB)

**Response** (200):
```json
{
  "message": "Profile photo updated successfully",
  "data": {
    "foto": "https://res.cloudinary.com/kxrtex/image/upload/v1234567890/kxrtex/profiles/abc123.jpg"
  }
}
```

---

### Upload Portfolio Images

**POST** `/upload/portfolio`

Upload multiple portfolio images (artists only).

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
- `files`: image files (multiple, max 10 per request)

**Response** (200):
```json
{
  "message": "3 images added to portfolio",
  "data": {
    "portfolio": [
      "https://res.cloudinary.com/kxrtex/image/upload/v1/portfolio/img1.jpg",
      "https://res.cloudinary.com/kxrtex/image/upload/v1/portfolio/img2.jpg",
      "https://res.cloudinary.com/kxrtex/image/upload/v1/portfolio/img3.jpg"
    ],
    "total": 3,
    "limite": 5
  }
}
```

**Errors**:
- `400`: Limit exceeded (5 for FREE, 15 for PLUS, unlimited for PRO)
- `403`: Only artists can upload portfolio

---

### Delete Portfolio Image

**DELETE** `/upload/portfolio`

Remove image from portfolio.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "imageUrl": "https://res.cloudinary.com/kxrtex/image/upload/v1/portfolio/img1.jpg"
}
```

**Response** (200):
```json
{
  "message": "Image removed from portfolio successfully",
  "data": {
    "portfolio": [
      "https://res.cloudinary.com/kxrtex/image/upload/v1/portfolio/img2.jpg",
      "https://res.cloudinary.com/kxrtex/image/upload/v1/portfolio/img3.jpg"
    ],
    "total": 2
  }
}
```

---

## WebSocket Events (Socket.IO)

### Connection

Connect to Socket.IO server:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### Events

#### join-booking

Join a booking chat room.

**Emit**:
```javascript
socket.emit('join-booking', {
  bookingId: 'uuid'
});
```

**Response**:
```javascript
socket.on('user-joined', (data) => {
  // { userId: 'uuid', userName: 'DJ Test' }
});
```

---

#### leave-booking

Leave a booking chat room.

**Emit**:
```javascript
socket.emit('leave-booking', {
  bookingId: 'uuid'
});
```

---

#### new-message

Send a message (prefer REST API for persistence).

**Emit**:
```javascript
socket.emit('new-message', {
  bookingId: 'uuid',
  conteudo: 'Hello!'
});
```

**Broadcast to room**:
```javascript
socket.on('new-message', (message) => {
  // { id: 'uuid', conteudo: 'Hello!', remetenteId: 'uuid', ... }
});
```

---

#### typing

Indicate user is typing.

**Emit**:
```javascript
socket.emit('typing', {
  bookingId: 'uuid'
});
```

**Broadcast to room**:
```javascript
socket.on('typing', (data) => {
  // { userId: 'uuid', userName: 'DJ Test' }
});
```

---

#### stop-typing

Indicate user stopped typing.

**Emit**:
```javascript
socket.emit('stop-typing', {
  bookingId: 'uuid'
});
```

**Broadcast to room**:
```javascript
socket.on('stop-typing', (data) => {
  // { userId: 'uuid' }
});
```

---

#### new-booking-request

Notification for new booking (artist receives).

**Listen**:
```javascript
socket.on('new-booking-request', (booking) => {
  // { id: 'uuid', contratante: {...}, dataEvento: '...', ... }
});
```

---

#### booking-accepted

Notification when artist accepts (contratante receives).

**Listen**:
```javascript
socket.on('booking-accepted', (booking) => {
  // { id: 'uuid', status: 'ACEITO', ... }
});
```

---

#### payment-confirmed

Notification when payment is confirmed.

**Listen**:
```javascript
socket.on('payment-confirmed', (data) => {
  // { bookingId: 'uuid', status: 'CONFIRMADO' }
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": ["Additional detail 1", "Additional detail 2"],
  "statusCode": 400
}
```

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

---

## Rate Limiting

**Limits**:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

**Headers** (on rate limit):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698345600
Retry-After: 900
```

**Response** (429):
```json
{
  "error": "Too many requests, please try again later",
  "statusCode": 429,
  "retryAfter": 900
}
```

---

## Webhooks

### ASAAS Payment Webhook

**Endpoint**: `POST /payments/webhook`

**Headers**:
```
X-ASAAS-Signature: signature_hash
```

**Body** (payment confirmed):
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_xxx",
    "externalReference": "booking_uuid",
    "value": 2300,
    "status": "CONFIRMED"
  }
}
```

**Response**: `200 OK`

---

## Postman Collection

Import this base configuration into Postman:

```json
{
  "info": {
    "name": "KXRTEX API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

Set token after login in Pre-request Script:
```javascript
pm.environment.set("token", pm.response.json().token);
```

Use in Authorization header:
```
Bearer {{token}}
```

---

**Questions?** Open an issue or refer to the implementation in `backend/src/controllers/`.

**Happy Coding! 🚀**
