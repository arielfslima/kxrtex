# KXRTEX - Deployment Guide

**Version**: 1.0.0
**Last Updated**: October 24, 2025
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Deployment](#backend-deployment)
3. [Web Deployment](#web-deployment)
4. [Mobile Deployment](#mobile-deployment)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

### Architecture

```
┌─────────────┐
│   Mobile    │──────┐
│   (Expo)    │      │
└─────────────┘      │
                     ├──► Backend (Node.js) ──► PostgreSQL
┌─────────────┐      │         │
│   Web       │──────┘         ├──► Cloudinary
│  (Vercel)   │                ├──► ASAAS
└─────────────┘                └──► Socket.IO
```

### Recommended Stack

**Backend**:
- Platform: AWS EC2 / Heroku / DigitalOcean / Railway
- Database: AWS RDS / Heroku Postgres / Supabase
- File Storage: Cloudinary (already integrated)
- Payment: ASAAS (already integrated)

**Web**:
- Platform: Vercel / Netlify / AWS Amplify
- CDN: Cloudflare (optional)

**Mobile**:
- Build: EAS Build (Expo Application Services)
- Distribution: App Store Connect + Google Play Console

---

## Backend Deployment

### Option 1: Heroku (Easiest)

#### Prerequisites
- Heroku account
- Heroku CLI installed
- Git repository

#### Steps

1. **Login to Heroku**:
```bash
heroku login
```

2. **Create Heroku app**:
```bash
cd backend
heroku create kxrtex-api
```

3. **Add PostgreSQL addon**:
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set ASAAS_API_KEY=your_asaas_production_key
heroku config:set ASAAS_ENVIRONMENT=production
heroku config:set ASAAS_WEBHOOK_SECRET=your_webhook_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret
heroku config:set FRONTEND_URL=https://kxrtex.vercel.app
```

5. **Deploy**:
```bash
git push heroku main
```

6. **Run migrations**:
```bash
heroku run npx prisma migrate deploy
```

7. **Seed database** (optional):
```bash
heroku run npm run db:seed
```

8. **Open app**:
```bash
heroku open
```

#### Configure Buildpack

Create `Procfile` in backend root:
```
web: npm start
release: npx prisma migrate deploy
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "npx prisma generate"
  }
}
```

---

### Option 2: AWS EC2

#### Prerequisites
- AWS account
- EC2 instance (t2.micro for testing, t2.medium+ for production)
- SSH access

#### Steps

1. **SSH into instance**:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PostgreSQL**:
```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres createuser kxrtex
sudo -u postgres createdb kxrtex
sudo -u postgres psql -c "ALTER USER kxrtex PASSWORD 'secure_password';"
```

4. **Clone repository**:
```bash
git clone https://github.com/your-repo/KXRTEX.git
cd KXRTEX/backend
```

5. **Install dependencies**:
```bash
npm install --production
```

6. **Create .env**:
```bash
cat > .env << EOL
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://kxrtex:secure_password@localhost:5432/kxrtex
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
ASAAS_API_KEY=your_production_key
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_SECRET=your_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-frontend.com
EOL
```

7. **Run migrations**:
```bash
npx prisma migrate deploy
npx prisma generate
```

8. **Install PM2** (process manager):
```bash
sudo npm install -g pm2
```

9. **Start application**:
```bash
pm2 start src/server.js --name kxrtex-api
pm2 save
pm2 startup
```

10. **Configure Nginx** (reverse proxy):
```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/kxrtex`:
```nginx
server {
    listen 80;
    server_name api.kxrtex.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/kxrtex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

11. **Setup SSL** (Let's Encrypt):
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.kxrtex.com
```

12. **Configure firewall**:
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

### Option 3: DigitalOcean App Platform

1. **Connect GitHub repository**
2. **Select backend folder**
3. **Configure**:
   - Build Command: `npm install && npx prisma generate`
   - Run Command: `npm start`
   - Environment: Node.js 18
4. **Add PostgreSQL database** (managed)
5. **Set environment variables** (same as Heroku)
6. **Deploy**

---

## Web Deployment

### Option 1: Vercel (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy from web folder**:
```bash
cd web
vercel
```

4. **Configure environment variables** in Vercel dashboard:
   - `VITE_API_URL`: https://api.kxrtex.com/api
   - `VITE_SOCKET_URL`: https://api.kxrtex.com

5. **Set production domain**:
```bash
vercel --prod
```

6. **Configure custom domain** (optional):
   - Go to Vercel dashboard
   - Add domain: kxrtex.com
   - Update DNS records

#### Auto-deploy from Git

1. Import repository in Vercel dashboard
2. Select web folder as root directory
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy

Every push to main branch will auto-deploy.

---

### Option 2: Netlify

1. **Connect GitHub repository**
2. **Configure build**:
   - Base directory: `web`
   - Build command: `npm run build`
   - Publish directory: `web/dist`
3. **Add environment variables**
4. **Deploy**

---

### Option 3: AWS Amplify

1. **Connect repository**
2. **Add build specification** (`amplify.yml`):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd web
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: web/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```
3. **Add environment variables**
4. **Deploy**

---

## Mobile Deployment

### Prerequisites
- Expo account (free)
- Apple Developer account ($99/year for iOS)
- Google Play Developer account ($25 one-time for Android)

### 1. Setup EAS Build

```bash
cd mobile
npm install -g eas-cli
eas login
```

### 2. Configure EAS

Create `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Update app.json

```json
{
  "expo": {
    "name": "KXRTEX",
    "slug": "kxrtex",
    "version": "1.0.0",
    "owner": "your-expo-username",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

Get project ID:
```bash
eas init
```

### 4. Build for Android

#### Development Build (for testing)
```bash
eas build --platform android --profile development
```

#### Production Build (for Google Play)
```bash
eas build --platform android --profile production
```

This creates an APK/AAB file. Download and test locally:
```bash
eas build:run -p android
```

### 5. Submit to Google Play

1. **Create Google Play account**
2. **Create app in Play Console**
3. **Submit with EAS**:
```bash
eas submit -p android
```

Or manually:
1. Download AAB from EAS Build
2. Upload to Play Console
3. Fill app details (description, screenshots, etc.)
4. Submit for review

### 6. Build for iOS

#### Development Build
```bash
eas build --platform ios --profile development
```

#### Production Build
```bash
eas build --platform ios --profile production
```

You'll need:
- Apple Developer account
- iOS Distribution Certificate
- Provisioning Profile

EAS will help you create these.

### 7. Submit to App Store

```bash
eas submit -p ios
```

Or manually:
1. Download IPA from EAS Build
2. Upload with Transporter app
3. Fill app details in App Store Connect
4. Submit for review

---

### Production Environment Variables

Create `.env.production` in mobile:
```env
API_BASE_URL=https://api.kxrtex.com/api
SOCKET_URL=https://api.kxrtex.com
```

Update build configuration to use production env:
```json
{
  "build": {
    "production": {
      "env": {
        "API_BASE_URL": "https://api.kxrtex.com/api",
        "SOCKET_URL": "https://api.kxrtex.com"
      }
    }
  }
}
```

---

## Database Setup

### Option 1: Heroku Postgres

Already configured if using Heroku for backend.

### Option 2: AWS RDS

1. **Create RDS instance**:
   - Engine: PostgreSQL 15
   - Instance: db.t3.micro (free tier)
   - Storage: 20GB SSD
   - Public access: Yes (for development)

2. **Configure security group**:
   - Allow PostgreSQL (port 5432) from your IP
   - Allow from backend EC2 security group

3. **Get connection string**:
```
postgresql://username:password@endpoint:5432/kxrtex
```

4. **Update DATABASE_URL** in backend

### Option 3: Supabase (Recommended)

1. **Create Supabase project**
2. **Copy connection string** (postgres://)
3. **Enable connection pooling** (recommended)
4. **Update DATABASE_URL**

Connection string format:
```
postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres
```

---

## Environment Variables

### Backend (.env)

```bash
# App
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/kxrtex

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# ASAAS Payment
ASAAS_API_KEY=your-production-api-key
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_SECRET=your-webhook-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=https://kxrtex.com

# Optional
SENTRY_DSN=your-sentry-dsn
SENDGRID_API_KEY=your-sendgrid-key
FIREBASE_SERVICE_ACCOUNT=path-to-firebase-json
```

### Web (.env.production)

```bash
VITE_API_URL=https://api.kxrtex.com/api
VITE_SOCKET_URL=https://api.kxrtex.com
```

### Mobile (.env.production)

```bash
API_BASE_URL=https://api.kxrtex.com/api
SOCKET_URL=https://api.kxrtex.com
```

---

## Monitoring & Maintenance

### Error Tracking

**Sentry Setup**:

1. **Install**:
```bash
npm install @sentry/node
```

2. **Configure** (backend/src/server.js):
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Logging

**Winston Setup**:

```bash
npm install winston
```

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Database Backups

**Heroku Postgres**:
```bash
heroku pg:backups:schedule DATABASE_URL --at '02:00 America/Sao_Paulo'
```

**AWS RDS**:
- Enable automated backups (retention: 7-30 days)
- Create manual snapshots before major updates

**Supabase**:
- Automatic daily backups included
- Point-in-time recovery available

### Health Checks

**Endpoint**: GET `/health`

**UptimeRobot** configuration:
- Monitor: https://api.kxrtex.com/health
- Interval: 5 minutes
- Alert: Email/Slack on downtime

### Performance Monitoring

**New Relic / DataDog**:
1. Create account
2. Install agent
3. Configure API key
4. Monitor:
   - Response times
   - Error rates
   - Database performance
   - Memory/CPU usage

---

## SSL/TLS Setup

### Let's Encrypt (Free)

**For backend on EC2**:
```bash
sudo certbot --nginx -d api.kxrtex.com
```

**Auto-renewal**:
```bash
sudo certbot renew --dry-run
```

Add to crontab:
```bash
0 0 1 * * certbot renew --quiet
```

### Cloudflare (Recommended)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable:
   - SSL/TLS: Full (strict)
   - Always Use HTTPS
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression

---

## CDN Setup

### Cloudflare

1. **Add domain to Cloudflare**
2. **Enable**:
   - Caching
   - Auto Minify
   - Brotli
   - HTTP/3
3. **Page Rules**:
   - Cache everything for `/assets/*`
   - Cache API responses (if applicable)

### AWS CloudFront

1. **Create distribution**
2. **Origin**: Your web domain
3. **Cache behavior**:
   - Compress objects: Yes
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: Caching Optimized
4. **Update DNS** to point to CloudFront

---

## Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error tracking setup
- [ ] Backup strategy defined

### Deployment

- [ ] Deploy database (or provision managed DB)
- [ ] Run migrations
- [ ] Deploy backend
- [ ] Deploy web frontend
- [ ] Build mobile apps
- [ ] Submit to app stores
- [ ] Configure monitoring
- [ ] Test all integrations
- [ ] Verify payment webhooks

### Post-deployment

- [ ] Smoke test all features
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups working
- [ ] Update documentation
- [ ] Announce launch

---

## Rollback Strategy

### Backend

**Heroku**:
```bash
heroku releases
heroku rollback v123
```

**PM2** (EC2):
```bash
pm2 stop kxrtex-api
git checkout previous-version
npm install
pm2 restart kxrtex-api
```

### Web

**Vercel**:
- Go to Deployments
- Select previous deployment
- Click "Promote to Production"

### Database

**Restore from backup**:
```bash
# Heroku
heroku pg:backups:restore BACKUP_ID DATABASE_URL

# PostgreSQL
psql kxrtex < backup.sql
```

---

## Scaling Considerations

### Horizontal Scaling

**Backend**:
- Add load balancer (Nginx, AWS ALB)
- Deploy multiple instances
- Use Redis for session storage
- Enable sticky sessions for Socket.IO

**Database**:
- Read replicas for queries
- Connection pooling (PgBouncer)
- Database sharding (if needed)

### Vertical Scaling

**Increase resources**:
- More RAM
- More CPU cores
- Faster disk (SSD)

### Caching

**Redis Setup**:
```bash
npm install redis
```

Cache strategies:
- API responses (short TTL)
- User sessions
- Socket.IO adapter (for multi-instance)

---

## Cost Estimates

### Minimal Setup (MVP)
- Backend: Heroku Dyno Eco ($5/month) or Railway ($5/month)
- Database: Heroku Postgres Mini ($5/month) or Supabase Free
- Web: Vercel Free
- Mobile: Expo Free + App Store ($99/year) + Google Play ($25 one-time)
- **Total**: ~$15/month + $124 initial

### Production Setup
- Backend: AWS EC2 t3.medium ($30/month)
- Database: AWS RDS t3.micro ($15/month)
- CDN: Cloudflare Free
- Storage: Cloudinary Free (10GB/month)
- Monitoring: Sentry Free (5K errors/month)
- **Total**: ~$45/month

### High Traffic Setup
- Backend: Multiple EC2 instances + Load Balancer ($150+/month)
- Database: RDS with replicas ($100+/month)
- CDN: Cloudflare Pro ($20/month)
- Redis: ElastiCache ($15/month)
- **Total**: $285+/month

---

**Next Steps**: After deployment, monitor performance and iterate based on user feedback.

**Questions?** Refer to platform-specific documentation or create an issue in the repository.

🚀 **Happy Deploying!**
