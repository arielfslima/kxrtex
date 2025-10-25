# KXRTEX Production Deployment Guide

**Version:** 1.0
**Date:** October 24, 2025
**Status:** Ready for Production Deployment

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Environment Setup](#2-environment-setup)
3. [Database Deployment](#3-database-deployment)
4. [Backend Deployment](#4-backend-deployment)
5. [Web Frontend Deployment](#5-web-frontend-deployment)
6. [Mobile App Deployment](#6-mobile-app-deployment)
7. [External Services Configuration](#7-external-services-configuration)
8. [Post-Deployment Testing](#8-post-deployment-testing)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Rollback Procedures](#10-rollback-procedures)

---

## 1. Pre-Deployment Checklist

### Code Quality
- [x] All unit tests passing
- [x] No critical bugs in issue tracker
- [x] Code reviewed and approved
- [x] Documentation up to date
- [ ] Security audit completed
- [ ] Performance testing completed

### Infrastructure
- [ ] Production domain purchased (kxrtex.com)
- [ ] SSL certificates ready
- [ ] Hosting accounts created
- [ ] Monitoring tools configured
- [ ] Backup strategy defined

### External Services
- [ ] ASAAS production account approved
- [ ] Firebase project created
- [ ] Cloudinary account set up
- [ ] Email service configured (SendGrid)
- [ ] Redis instance provisioned (optional)

### Legal & Compliance
- [ ] Terms of Service written
- [ ] Privacy Policy (LGPD compliant)
- [ ] Cookie Policy
- [ ] User agreements finalized

---

## 2. Environment Setup

### Required Accounts

#### 2.1 Hosting Platform (Backend)
**Recommended: Railway.app**

**Why Railway:**
- ✅ Easy PostgreSQL provisioning
- ✅ Automatic deployments from GitHub
- ✅ Built-in Redis support
- ✅ Generous free tier
- ✅ Simple environment variable management

**Alternative: Render.com**
- Similar features
- Good PostgreSQL support
- Free tier available

#### 2.2 Frontend Hosting (Web)
**Recommended: Vercel**

**Why Vercel:**
- ✅ Optimized for React/Vite
- ✅ Automatic deployments
- ✅ Edge network (CDN)
- ✅ Free SSL
- ✅ Preview deployments

**Alternative: Netlify**
- Similar feature set
- Good for static sites

#### 2.3 Mobile App Distribution
**Required:**
- Apple Developer Account ($99/year)
- Google Play Console ($25 one-time)

---

## 3. Database Deployment

### Option 1: Railway PostgreSQL (Recommended)

#### Step 1: Create Database
```bash
# In Railway dashboard:
1. New Project → "KXRTEX Backend"
2. Add PostgreSQL service
3. Copy DATABASE_URL from Variables tab
```

#### Step 2: Configure Connection
```bash
# DATABASE_URL format:
postgresql://user:password@host:port/database?sslmode=require

# Example:
DATABASE_URL="postgresql://postgres:xyzpass@containers-us-west-123.railway.app:5432/railway"
```

#### Step 3: Run Migrations
```bash
cd backend

# Set DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

#### Step 4: Seed Initial Data
```bash
# Seed categories and initial config
npx prisma db seed

# Or use custom seed script
node scripts/seed-production.js
```

### Option 2: Supabase PostgreSQL

#### Advantages:
- Built-in auth (if needed)
- Real-time subscriptions
- Storage included
- Generous free tier

#### Setup:
```bash
1. Go to supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Use same migration steps as Railway
```

### Database Backup Strategy

#### Automated Backups (Railway)
```bash
# Railway provides automatic daily backups
# Access via: Database → Backups tab

# Manual backup:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

#### Backup to S3 (Production)
```bash
# Install AWS CLI
apt install awscli

# Backup script (run daily via cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > /tmp/kxrtex_backup_$DATE.sql.gz
aws s3 cp /tmp/kxrtex_backup_$DATE.sql.gz s3://kxrtex-backups/
rm /tmp/kxrtex_backup_$DATE.sql.gz
```

---

## 4. Backend Deployment

### Option 1: Railway Deployment (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure .gitignore is correct
cat backend/.gitignore
# Should include:
# .env
# node_modules/
# dist/
# *.log
```

#### Step 2: Connect GitHub
```bash
1. Railway Dashboard → New Project
2. "Deploy from GitHub repo"
3. Select: your-username/KXRTEX
4. Root directory: /backend
```

#### Step 3: Configure Build Settings
```json
{
  "buildCommand": "npm install && npx prisma generate",
  "startCommand": "npm start",
  "watchPatterns": ["backend/**"]
}
```

#### Step 4: Set Environment Variables
```bash
# In Railway → Variables tab, add:

NODE_ENV=production
PORT=3000

# Database (auto-provided by Railway if using their PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=<generate-secure-random-string-64-chars>
JWT_EXPIRES_IN=7d

# Frontend URLs (for CORS)
FRONTEND_URL=https://kxrtex.com,https://www.kxrtex.com

# ASAAS Payment Gateway
ASAAS_API_KEY=<your-production-api-key>
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_SECRET=<generate-secure-random-string>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Firebase (for push notifications)
FIREBASE_SERVICE_ACCOUNT=<paste-entire-json-here>
# OR
FIREBASE_SERVICE_ACCOUNT_PATH=/app/firebase-service-account.json

# Redis (if using)
REDIS_URL=${{Redis.REDIS_URL}}

# SendGrid (email)
SENDGRID_API_KEY=<your-api-key>
SENDGRID_FROM_EMAIL=noreply@kxrtex.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 5: Deploy
```bash
# Railway auto-deploys on git push
git push origin main

# Monitor deployment:
# Railway Dashboard → Deployments → View Logs
```

#### Step 6: Verify Deployment
```bash
# Test health endpoint
curl https://kxrtex-backend.up.railway.app/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-10-24T...",
  "environment": "production"
}
```

### Option 2: Docker Deployment (Any Platform)

#### Dockerfile (already exists)
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start server
CMD ["npm", "start"]
```

#### Build & Deploy
```bash
# Build image
cd backend
docker build -t kxrtex-backend:latest .

# Run locally (test)
docker run -p 3000:3000 --env-file .env.production kxrtex-backend:latest

# Push to container registry
docker tag kxrtex-backend:latest registry.railway.app/kxrtex-backend:latest
docker push registry.railway.app/kxrtex-backend:latest
```

### Custom Domain Setup

#### Step 1: Configure DNS
```bash
# Add CNAME record in your domain registrar:
Type: CNAME
Name: api
Value: kxrtex-backend.up.railway.app
TTL: 3600
```

#### Step 2: Add Custom Domain in Railway
```bash
1. Railway Dashboard → Settings → Domains
2. Add domain: api.kxrtex.com
3. Wait for SSL certificate (auto-provisioned)
```

#### Step 3: Update CORS
```bash
# In Railway variables, update:
FRONTEND_URL=https://kxrtex.com,https://www.kxrtex.com,https://app.kxrtex.com
```

---

## 5. Web Frontend Deployment

### Vercel Deployment

#### Step 1: Prepare Build
```bash
cd web

# Create .env.production
cat > .env.production << EOF
VITE_API_URL=https://api.kxrtex.com
VITE_SOCKET_URL=https://api.kxrtex.com
VITE_ENVIRONMENT=production
EOF

# Test production build locally
npm run build
npm run preview
```

#### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd web
vercel --prod

# Or connect via GitHub:
# 1. Go to vercel.com
# 2. Import Git Repository
# 3. Select KXRTEX repo
# 4. Root directory: web
# 5. Framework preset: Vite
```

#### Step 3: Configure Environment Variables
```bash
# In Vercel Dashboard → Settings → Environment Variables:

VITE_API_URL=https://api.kxrtex.com
VITE_SOCKET_URL=https://api.kxrtex.com
VITE_ENVIRONMENT=production
```

#### Step 4: Custom Domain
```bash
# Vercel Dashboard → Settings → Domains
# Add: kxrtex.com, www.kxrtex.com

# Configure DNS (in your registrar):
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Step 5: Force HTTPS
```bash
# Vercel automatically enforces HTTPS
# Verify in Settings → Domains → HTTPS
```

---

## 6. Mobile App Deployment

### iOS Deployment (App Store)

#### Step 1: Prepare Build
```bash
cd mobile

# Update app.json for production
{
  "expo": {
    "name": "KXRTEX",
    "slug": "kxrtex",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.kxrtex.app",
      "buildNumber": "1"
    }
  }
}

# Create .env.production
cat > .env.production << EOF
API_URL=https://api.kxrtex.com
SOCKET_URL=https://api.kxrtex.com
ENVIRONMENT=production
EOF
```

#### Step 2: Configure EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Create eas.json
{
  "build": {
    "production": {
      "ios": {
        "bundler": "metro",
        "enterpriseProvisioning": "universal"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "API_URL": "https://api.kxrtex.com",
        "SOCKET_URL": "https://api.kxrtex.com"
      }
    }
  }
}
```

#### Step 3: Build for App Store
```bash
# Build iOS
eas build --platform ios --profile production

# Download IPA when complete
# Upload to App Store Connect using Transporter
```

#### Step 4: App Store Listing
```bash
# Prepare:
- App icon (1024x1024)
- 5-6 screenshots per device size
- App description (Portuguese)
- Keywords: booking, artistas, dj, eventos, underground
- Privacy policy URL
- Support URL
```

### Android Deployment (Play Store)

#### Step 1: Build AAB
```bash
# Build Android App Bundle
eas build --platform android --profile production

# Download AAB when complete
```

#### Step 2: Play Console Setup
```bash
# Create app in console.play.google.com
1. Create application
2. App name: KXRTEX
3. Default language: Portuguese (Brazil)
4. App/Game: App
5. Free/Paid: Free
```

#### Step 3: Upload AAB
```bash
# Play Console → Production → Create new release
1. Upload kxrtex-1.0.0.aab
2. Release name: 1.0.0
3. Release notes: "Lançamento inicial do KXRTEX"
4. Save → Review → Start rollout
```

#### Step 4: Store Listing
```bash
# Required assets:
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (4-8 images)
- Short description (80 chars)
- Full description (4000 chars)
- Privacy policy URL
```

---

## 7. External Services Configuration

### 7.1 ASAAS Payment Gateway

#### Production Account
```bash
# 1. Sign up at https://www.asaas.com
# 2. Complete KYC verification
# 3. Configure webhook URL:
#    https://api.kxrtex.com/api/payments/webhook

# 4. Get production API key:
#    Dashboard → Integrações → API Key

# 5. Configure in Railway:
ASAAS_API_KEY=your-production-key
ASAAS_ENVIRONMENT=production
```

#### Webhook Configuration
```bash
# ASAAS Dashboard → Webhooks
URL: https://api.kxrtex.com/api/payments/webhook
Events to listen:
- PAYMENT_RECEIVED
- PAYMENT_CONFIRMED
- PAYMENT_REFUNDED
- PAYMENT_OVERDUE

# Set webhook secret:
ASAAS_WEBHOOK_SECRET=<generate-secure-random-string>
```

### 7.2 Firebase Cloud Messaging

#### Project Setup
```bash
# 1. Go to console.firebase.google.com
# 2. Create project: "KXRTEX"
# 3. Add iOS app: com.kxrtex.app
# 4. Add Android app: com.kxrtex.app
# 5. Add Web app: kxrtex.com
```

#### Service Account
```bash
# 1. Project Settings → Service Accounts
# 2. Generate new private key
# 3. Download JSON file
# 4. Copy entire JSON to Railway variable:

FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"kxrtex",...}'

# Or upload file to Railway and set path:
FIREBASE_SERVICE_ACCOUNT_PATH=/app/firebase-service-account.json
```

#### iOS APNs Configuration
```bash
# 1. Apple Developer → Certificates, Identifiers & Profiles
# 2. Create APNs Key
# 3. Download .p8 file
# 4. Upload to Firebase Console → Project Settings → Cloud Messaging → iOS
```

#### Android Configuration
```bash
# 1. Firebase Console → Project Settings → Cloud Messaging
# 2. Copy Server Key
# 3. Used automatically by Firebase Admin SDK
```

### 7.3 Cloudinary

#### Account Setup
```bash
# 1. Sign up at cloudinary.com
# 2. Choose plan: Plus ($99/month recommended)
# 3. Get credentials from Dashboard

# Configure in Railway:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

#### Upload Presets
```bash
# Cloudinary Dashboard → Settings → Upload
# Create preset: "kxrtex_profiles"
- Signing mode: Unsigned
- Folder: profiles/
- Transformation: c_fill,w_500,h_500,q_auto,f_auto

# Create preset: "kxrtex_portfolio"
- Signing mode: Unsigned
- Folder: portfolio/
- Transformation: c_fill,w_1200,h_800,q_auto,f_auto
```

### 7.4 SendGrid (Email)

#### Setup
```bash
# 1. Sign up at sendgrid.com
# 2. Verify sender email: noreply@kxrtex.com
# 3. Create API key with Mail Send permissions

# Configure in Railway:
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@kxrtex.com
SENDGRID_FROM_NAME=KXRTEX
```

#### Email Templates
```bash
# Create dynamic templates:
1. Welcome email
2. Password reset
3. Booking confirmation
4. Payment receipt
5. Event reminder
```

---

## 8. Post-Deployment Testing

### 8.1 API Health Checks

```bash
# Test backend health
curl https://api.kxrtex.com/health

# Test database connection
curl https://api.kxrtex.com/api/artists?limite=1

# Test WebSocket
wscat -c wss://api.kxrtex.com
> {"event": "ping"}
```

### 8.2 Critical User Flows

#### Test 1: User Registration
```bash
# Web browser
1. Go to https://kxrtex.com/register
2. Register as Contratante
3. Verify email sent (check SendGrid logs)
4. Login successfully
```

#### Test 2: Artist Profile Creation
```bash
1. Register as ARTISTA
2. Complete profile with portfolio
3. Upload 3 images
4. Verify images appear (check Cloudinary dashboard)
5. Publish profile
```

#### Test 3: Booking Flow (End-to-End)
```bash
1. Contratante searches for artists
2. Selects artist, creates booking request
3. Artist receives notification (check Firebase logs)
4. Artist accepts booking
5. Contratante makes payment via PIX
6. Payment confirmed (check ASAAS dashboard)
7. Both users receive confirmation notifications
```

#### Test 4: Real-time Chat
```bash
1. Open booking detail on two devices/browsers
2. Send message from Contratante
3. Verify message appears instantly for Artista
4. Test typing indicators
5. Test anti-circumvention (send phone number)
6. Verify warning message appears
```

#### Test 5: Check-in/Check-out
```bash
1. On event day, artist does check-in
2. Upload photo, verify geolocation
3. After event, do check-out
4. Verify booking status changes to CONCLUIDO
5. Verify payment release scheduled for +48h
```

### 8.3 Performance Testing

#### Load Test with Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test script
cat > artillery-test.yml << EOF
config:
  target: "https://api.kxrtex.com"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/api/artists"
      - post:
          url: "/api/auth/login"
          json:
            email: "test@test.com"
            senha: "senha123"
EOF

# Run test
artillery run artillery-test.yml
```

#### Expected Results
```bash
# Target metrics:
- Response time p95: < 500ms
- Response time p99: < 1000ms
- Error rate: < 0.1%
- Concurrent users: 100+
```

---

## 9. Monitoring & Maintenance

### 9.1 Error Tracking (Sentry)

#### Setup
```bash
# 1. Sign up at sentry.io
# 2. Create project: KXRTEX Backend
# 3. Get DSN

# Install Sentry SDK
cd backend
npm install @sentry/node

# Configure in server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

# Add to Railway variables:
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 9.2 Uptime Monitoring

#### UptimeRobot (Free)
```bash
# 1. Sign up at uptimerobot.com
# 2. Add monitor:
#    - Type: HTTP(s)
#    - URL: https://api.kxrtex.com/health
#    - Interval: 5 minutes
#    - Alert: Email + SMS
```

### 9.3 Log Management

#### Railway Logs
```bash
# View logs in Railway dashboard
# Or use CLI:
railway logs --environment production

# Set log retention: 7 days (free tier)
```

#### LogDNA / Better Stack (Optional)
```bash
# For advanced log aggregation
# Integrates with Railway
# Search, filter, alert capabilities
```

### 9.4 Database Monitoring

#### Prisma Studio (Development)
```bash
# Access production DB carefully
DATABASE_URL="production-url" npx prisma studio
```

#### PostgreSQL Monitoring
```bash
# Railway provides built-in metrics:
- Connections
- Storage usage
- Query performance
- Slow queries
```

---

## 10. Rollback Procedures

### 10.1 Backend Rollback

#### Railway Rollback
```bash
# Railway Dashboard → Deployments
# Click previous deployment → "Redeploy"
```

#### Manual Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout specific commit
git checkout abc1234
git push origin main --force
```

### 10.2 Database Rollback

#### Prisma Migration Rollback
```bash
# WARNING: This may cause data loss
# Only use in emergencies

# Revert last migration
npx prisma migrate resolve --rolled-back "migration-name"

# Restore from backup
pg_restore -d $DATABASE_URL backup_20251024.sql
```

### 10.3 Frontend Rollback

#### Vercel Rollback
```bash
# Vercel Dashboard → Deployments
# Find previous deployment → "Promote to Production"
```

---

## Appendix A: Environment Variables Reference

### Backend (.env.production)
```bash
# Core
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://kxrtex.com,https://www.kxrtex.com

# Payments
ASAAS_API_KEY=<production-key>
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_SECRET=<random-string>

# Storage
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# Notifications
FIREBASE_SERVICE_ACCOUNT=<json-string>

# Email
SENDGRID_API_KEY=<key>
SENDGRID_FROM_EMAIL=noreply@kxrtex.com

# Redis (optional)
REDIS_URL=redis://...

# Monitoring
SENTRY_DSN=<dsn>
```

### Web (.env.production)
```bash
VITE_API_URL=https://api.kxrtex.com
VITE_SOCKET_URL=https://api.kxrtex.com
VITE_ENVIRONMENT=production
```

### Mobile (.env.production)
```bash
API_URL=https://api.kxrtex.com
SOCKET_URL=https://api.kxrtex.com
ENVIRONMENT=production
```

---

## Appendix B: SSL Certificate Setup

### Let's Encrypt (Free)
```bash
# Railway/Vercel handle this automatically
# Certificates auto-renew every 90 days
```

### Custom Certificate
```bash
# If you have your own certificate:
# Upload to Railway → Settings → Custom Domains → SSL
```

---

## Appendix C: Cost Estimation

### Monthly Costs (Initial Scale)

| Service | Tier | Cost |
|---------|------|------|
| Railway (Backend + DB) | Hobby | $5 |
| Vercel (Web) | Hobby | $0 |
| Cloudinary | Plus | $99 |
| Firebase | Spark | $0 |
| SendGrid | Essentials | $20 |
| Domain (.com) | Annual / 12 | $1 |
| Apple Developer | Annual / 12 | $8 |
| Google Play | One-time | $0 |
| Sentry | Developer | $0 |
| **Total** | | **~$133/month** |

### Scaling Costs (1000+ users)

| Service | Tier | Cost |
|---------|------|------|
| Railway | Pro | $20 |
| Vercel | Pro | $20 |
| Cloudinary | Plus | $99 |
| Firebase | Blaze (pay-as-go) | $10-50 |
| SendGrid | Pro | $90 |
| Redis Cloud | 30MB | $5 |
| **Total** | | **~$244-284/month** |

---

**Document Version:** 1.0
**Last Updated:** October 24, 2025
**Next Review:** After first production deployment

**Prepared by:** Claude Code
**Status:** ✅ Ready for Production Deployment
