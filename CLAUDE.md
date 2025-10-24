# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KXRTEX is an underground artist booking platform connecting "Contratantes" (hirers) with underground artists (DJs, MCs, Performers). The platform handles booking negotiations, secure payments with retention, real-time chat, and bilateral reviews.

**Key Business Rules:**
- Artist subscription tiers (FREE/PLUS/PRO) determine platform fees: 15%/10%/7%
- Payment flow: Contratante pays (booking + fee) → Platform retains → Release after event completion (48h delay)
- Distance >200km triggers 50% advance payment system with check-in verification
- Anti-circumvention system detects contact sharing in chat (phone, email, social media)

## Architecture

### Backend (`backend/`)
Node.js + Express + Prisma ORM + PostgreSQL + Socket.IO

**Key architectural patterns:**
- **Dual user system**: Single `Usuario` table with polymorphic relations to `Artista` or `Contratante` via `tipo` enum
- **Booking state machine**: PENDENTE → ACEITO → CONFIRMADO → EM_ANDAMENTO → CONCLUIDO (with CANCELADO/DISPUTA branches)
- **Socket.IO rooms**: Each booking has a `booking-${bookingId}` room for real-time chat
- **JWT auth middleware**: Enriches `req.user` with nested artista/contratante data from single DB query

**Authentication flow:**
1. Login returns JWT with `userId` claim
2. `authenticate` middleware verifies token and loads full user object with artista/contratante relations
3. `requireArtist`/`requireContratante` guards enforce role-based access

**Critical services to implement:**
- `services/asaas.service.js`: ASAAS payment gateway integration (not yet created)
- `services/cloudinary.service.js`: Image/video upload (base config exists in `config/cloudinary.js`)
- `jobs/`: Bull queue workers for scheduled tasks (folder exists but empty)

### Mobile (`mobile/`)
React Native + Expo Router (file-based routing) + Zustand (state)

**Navigation structure:**
- `app/index.jsx`: Splash → redirects to `(auth)` or `(tabs)` based on auth state
- `app/(auth)/`: Unauthenticated flows (welcome, login, register)
- `app/(tabs)/`: Main app (home, bookings, profile)

**State management:**
- Global auth: `src/store/authStore.js` (Zustand) persists via AsyncStorage
- API state: React Query wraps all API calls (configured in `app/_layout.jsx`)
- Real-time: Socket.IO client connects to backend in `app/_layout.jsx` with automatic lifecycle management

**Design system:**
- Dark theme: Background `#0D0D0D`, Primary `#8B0000`, Accent `#FF4444`
- All colors in `src/constants/colors.js`
- Glassmorphism surfaces: `rgba(139, 0, 0, 0.1)` with backdrop blur

### Database Schema

**Core entity relationships:**
```
Usuario (base user)
  ├─ Artista (1:1, optional)
  │   └─ Booking[] (artist side)
  └─ Contratante (1:1, optional)
      └─ Booking[] (client side)

Booking (central entity)
  ├─ Proposta[] (negotiation history)
  ├─ Mensagem[] (chat)
  ├─ Transacao[] (payments)
  ├─ CheckIn[] (event verification)
  ├─ Adiantamento? (advance payment, 1:1)
  └─ Avaliacao[] (reviews)
```

**Important enum states:**
- `StatusBooking`: Drives booking lifecycle; triggers payment release in CONCLUIDO state
- `PlanoArtista`: FREE/PLUS/PRO determines `taxaPlataforma` calculation
- `StatusVerificacao`: Affects artist ranking algorithm (verified badge)

## Development Commands

### Initial Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET required
npx prisma migrate dev --name init
npm run dev  # Runs on port 3000

# Mobile
cd mobile
npm install
cp .env.example .env
# Edit .env: API_URL (use local IP for device testing)
npm start
```

### Database Operations
```bash
cd backend
npx prisma migrate dev --name <migration_name>  # Create migration
npx prisma studio                                # Visual DB browser
npx prisma generate                              # Regenerate Prisma Client
npm run db:seed                                  # Populate database with test data
```

### Running Services
```bash
# Backend only
cd backend && npm run dev

# Mobile only
cd mobile && npm start

# Mobile with cache clear
cd mobile && npx expo start -c
```

## Key Implementation Notes

### When implementing artist search (`GET /api/artists`):
Ranking algorithm from PRD (docs/KXRTEX-PRD-Optimized.md):
```
score = (plano_weight * 40) + (avaliacao * 30) + (bookings_completos * 20) + (perfil_completo * 10)
plano_weight: PRO=3, PLUS=2, FREE=1
perfil_completo: bio(2) + portfolio_3+(3) + videos(2) + social_links(1) + verified(2)
```

### When implementing booking creation (`POST /api/bookings`):
1. Calculate `taxaPlataforma` based on artist's `plano`: FREE=15%, PLUS=10%, PRO=7%
2. Calculate `distanciaKm` between artist's cities and event location
3. Set `precisaAdiantamento = distanciaKm > 200`
4. Create initial `Proposta` with `tipo: INICIAL`
5. Emit Socket.IO event to artist: `io.to('user-${artistaId}').emit('new-booking-request')`

### When implementing chat anti-circumvention:
Detect patterns: phone numbers `\(\d{2}\)\s?\d{4,5}-?\d{4}`, emails, social handles `@\w+`
On detection: Create system `Mensagem` with warning, increment violation counter (not in schema yet)

### When integrating ASAAS payments:
- Use sandbox environment initially: `ASAAS_ENVIRONMENT=sandbox` in .env
- Webhook handler must verify `ASAAS_WEBHOOK_SECRET` header
- Payment retention: Don't use ASAAS split immediately; manually transfer after 48h post-event
- Advance payments: Create separate transaction, only release after `CheckIn` with `tipo: HOTEL`

### Mobile authentication flow:
```javascript
// On login success:
const { token, user } = response.data;
useAuthStore.getState().setAuth(user, token);  // Persists to AsyncStorage
router.replace('/(tabs)/home');

// API client auto-injects token via interceptor (src/services/api.js)
// On 401 response: interceptor calls useAuthStore.getState().logout()
```

## File Structure Conventions

### Backend
- `controllers/`: Request handlers, call services, return responses
- `services/`: Business logic, reusable across controllers
- `middlewares/`: `authenticate`, `validate(schema)`, `requireArtist/Contratante`
- `utils/validation.js`: Zod schemas for request validation
- Routes: Use `validate(schema)` middleware before controller

### Mobile
- `app/`: File-based routes (Expo Router)
- `src/components/`: Reusable UI components (BookingCard, ArtistCard, etc.)
- `src/screens/`: Screen components (ArtistsScreen, BookingsScreen, CreateBookingScreen, EditProfileScreen, etc.)
- `src/services/`: API calls, Socket.IO client
- `src/store/`: Zustand stores (currently only auth)

## External Services Setup

Required for full functionality (see `.env.example`):
- **ASAAS**: Payment processing (sandbox initially)
- **Cloudinary**: Media uploads (config exists, not used yet)
- **Firebase**: Push notifications (not configured)
- **SendGrid**: Transactional emails (not configured)
- **Redis**: Session/cache/Bull queues (optional for MVP)

## Testing the API

### Using Test Data (Recommended)

First, populate the database with test users:
```bash
cd backend
npm run db:seed
```

This creates 6 test users (all with password `senha123`):

**Contratante:**
- Email: `contratante@test.com`

**Artists (across all tiers):**
- `dj.underground@test.com` - DJ, FREE tier, R$ 500/h
- `mc.flow@test.com` - MC, FREE tier, R$ 300/h
- `dj.nexus@test.com` - DJ, PLUS tier, R$ 800/h, Verified
- `performer.eclipse@test.com` - Performer, PLUS tier, R$ 600/h
- `dj.phoenix@test.com` - DJ, PRO tier, R$ 1500/h, Verified

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Login with test user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "contratante@test.com", "senha": "senha123"}'

# List all artists
curl http://localhost:3000/api/artists

# Get artist details
curl http://localhost:3000/api/artists/{artistId}

# Authenticated request (replace <TOKEN>)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## Current State & Next Steps

**Implemented (Backend - 100%):**
- Complete database schema (14 tables)
- JWT authentication (register, login, middleware)
- Artist CRUD with search/filter/ranking algorithm
- Booking CRUD with state machine (create, accept, reject, confirm)
- Express server with Socket.IO configured
- Database seeds with 6 test users (backend/prisma/seed.js)

**Implemented (Mobile - 95%):**
- Complete navigation structure with Expo Router
- Authentication screens (welcome, login, register)
- Artist search with filters and pagination (home tab)
- Artist detail screen with portfolio
- Booking creation flow
- Bookings list with status filters (bookings tab)
- Booking detail screen
- Profile screen with user info
- Profile edit screen (artists only)
- Socket.IO integration in root layout (auto connect/disconnect)
- Design system and reusable components
- Loading/error states in all screens
- Pull-to-refresh functionality

**Immediate priorities (see docs/SESSION_SUMMARY_2025-10-24.md):**
1. Test complete booking flow end-to-end
2. Test payment integration (PIX and Card)
3. Test real-time chat functionality
4. Implement image upload UI (expo-image-picker)
5. Test on physical devices (Android/iOS)

**Not yet implemented:**
- Payment processing UI (components exist, need integration testing)
- Chat UI (components exist, need integration testing)
- Image upload UI
- Review system UI
- Check-in/check-out UI
- Admin panel
- Push notifications (Firebase)

## Important Documentation

- `docs/KXRTEX-PRD-Optimized.md`: Complete product requirements (business rules, flows, features)
- `docs/SESSION_SUMMARY_2025-10-24.md`: Latest session summary with all achievements and test credentials
- `docs/MOBILE_INTEGRATION_COMPLETE.md`: Complete mobile integration guide
- `docs/CURRENT_STATUS.md`: Current project status and testing instructions
- `docs/NEXT-STEPS.md`: Detailed development roadmap
- `docs/COMMANDS.md`: CLI reference for common tasks
- `docs/SETUP-SUMMARY.md`: What was configured in initial setup

Claude's Code Rules:
1. First, think about the problem, read the code base for the relevant files, and write a plan in tasks/todo.md.
2. The plan should have a list of tasks that you can mark as complete as you finish them.
3. Before you start working, contact me and I will check the plan.
4. Then start working on the tasks, marking them as complete as you go.
5. Please, every step of the way, just give me a detailed explanation of the changes you've made.
6. Make each task and code change as simple as possible. We want to avoid large or complex changes. Each change should impact as little code as possible. It all comes down to simplicity.
7. Finally, add a review section to the all.md file with a summary of the changes made and any other relevant information.
8. DON'T BE LAZY. NEVER BE LAZY. IF THERE IS A BUG, FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY.
9. MAKE ALL CORRECTIONS AND CODE CHANGES AS SIMPLE AS POSSIBLE. THEY SHOULD ONLY IMPACT THE CODE THAT IS NECESSARY AND RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY.
10. Before making a commit, check that there are proper unit tests for your new code, if not write them, add to the Test Suite and include in your commit
11. Do not use emojis in the code
