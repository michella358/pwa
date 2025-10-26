# 🚀 Deployment Guide - PWA Notification System

## 📋 Overview
Panduan lengkap untuk deploy PWA Notification System ke Vercel dengan Supabase PostgreSQL sebagai database.

## 🔧 Prerequisites
- [x] Akun Vercel
- [x] Akun Supabase
- [x] Repository GitHub/GitLab
- [x] Node.js 18+ terinstall

## 📊 Arsitektur Deployment
```
Frontend (Vercel) ←→ Backend API (Vercel Functions) ←→ Supabase PostgreSQL
```

## 🗄️ Setup Database (Supabase)

### 1. Buat Proyek Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Isi detail proyek:
   - **Name**: `pwa-notification-system`
   - **Database Password**: Password yang kuat
   - **Region**: Pilih yang terdekat
4. Tunggu proyek selesai dibuat (~2 menit)

### 2. Setup Database Schema
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file `supabase/migrations/001_create_tables.sql`
3. Klik "Run" untuk execute migration
4. Verifikasi tabel berhasil dibuat di Database → Tables

### 3. Dapatkan Kredensial
Di Project Settings → API:
- **Project URL**: `https://your-project-id.supabase.co`
- **anon public key**: untuk frontend
- **service_role secret key**: untuk backend

## 🚀 Deploy ke Vercel

### 1. Persiapan Repository
```bash
# Push ke GitHub/GitLab
git add .
git commit -m "Ready for deployment with Supabase"
git push origin main
```

### 2. Import Project ke Vercel
1. Login ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Import repository dari GitHub/GitLab
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `cd backend && npm install`
   - **Output Directory**: `backend`

### 3. Environment Variables
Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

#### Production Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Configuration
JWT_SECRET=your_production_jwt_secret_very_secure

# VAPID Keys for Web Push Notifications
VAPID_PUBLIC_KEY=your_production_vapid_public_key
VAPID_PRIVATE_KEY=your_production_vapid_private_key
VAPID_SUBJECT=mailto:your-production-email@domain.com

# WhatsApp API (Optional)
WHATSAPP_API_KEY=your_whatsapp_api_key

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
```

### 4. Deploy
1. Klik "Deploy" di Vercel
2. Tunggu build process selesai
3. Verifikasi deployment berhasil

## 🔧 Post-Deployment Setup

### 1. Buat Admin Master
```bash
# Clone repository di local
git clone your-repo-url
cd pwa-notification-system/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan kredensial production

# Buat admin master
node create-admin-supabase.js
```

### 2. Test API Endpoints
```bash
# Test health check
curl https://your-app.vercel.app/api/

# Test admin login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_admin_password"}'
```

### 3. Update Frontend Configuration
Update file frontend configuration untuk menggunakan production API:
```javascript
// frontend/src/config.js
const API_BASE_URL = 'https://your-app.vercel.app/api';
```

## 📱 Frontend Deployment

### Option 1: Static Site (Recommended)
```bash
# Build frontend
cd frontend
npm run build

# Deploy ke Vercel
vercel --prod
```

### Option 2: Monorepo Deployment
Update `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

## 🔒 Security Checklist

### Database Security
- [x] Row Level Security (RLS) aktif
- [x] Service key hanya untuk backend
- [x] Anon key untuk frontend (jika diperlukan)
- [x] SSL/TLS encryption

### API Security
- [x] JWT authentication
- [x] CORS configuration
- [x] Environment variables secure
- [x] No hardcoded secrets

### Vercel Security
- [x] Environment variables encrypted
- [x] HTTPS enforced
- [x] Custom domain (optional)

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Function logs: Vercel Dashboard → Functions
- Performance metrics: Analytics tab
- Error tracking: Real-time logs

### Supabase Monitoring
- Database metrics: Supabase Dashboard → Reports
- Query performance: Database → Query Performance
- Real-time logs: Logs & Stats

### Health Checks
```bash
# API health check
curl https://your-app.vercel.app/api/health

# Database connection check
curl https://your-app.vercel.app/api/db-status
```

## 💰 Cost Estimation

### Supabase Costs
- **Free Tier**: 500MB DB, 2GB bandwidth (development)
- **Pro Tier**: $25/month - 8GB DB, 250GB bandwidth (production)

### Vercel Costs
- **Hobby**: Free untuk personal projects
- **Pro**: $20/month untuk commercial projects

**Total Production Cost: ~$25-45/month**

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs di Vercel Dashboard
# Pastikan dependencies terinstall
npm install --production
```

#### 2. Database Connection Issues
```bash
# Test koneksi Supabase
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
supabase.from('users').select('count').then(console.log);
"
```

#### 3. Environment Variables
- Pastikan semua env vars ada di Vercel
- Restart deployment setelah update env vars
- Check case sensitivity

#### 4. CORS Issues
```javascript
// Update CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### Debug Commands
```bash
# Check Vercel logs
vercel logs your-deployment-url

# Check function logs
vercel logs --follow

# Local development
vercel dev
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support & Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

### Community
- Vercel Discord
- Supabase Discord
- Stack Overflow

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Database schema migrated
- [ ] Environment variables configured
- [ ] Security policies tested
- [ ] API endpoints tested locally

### Deployment
- [ ] Repository pushed to GitHub/GitLab
- [ ] Vercel project configured
- [ ] Environment variables set
- [ ] Deployment successful

### Post-Deployment
- [ ] Admin user created
- [ ] API endpoints tested
- [ ] Frontend connected
- [ ] Push notifications working
- [ ] Monitoring setup

### Production Ready
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Backup strategy implemented
- [ ] Error tracking setup
- [ ] Performance monitoring active

**🎉 Selamat! PWA Notification System Anda sudah live di production!**