# Setup Supabase untuk PWA Notification System

## 📋 Overview
Dokumentasi ini menjelaskan cara setup Supabase PostgreSQL sebagai database untuk PWA Notification System, menggantikan MongoDB.

## 🚀 Langkah Setup Supabase

### 1. Buat Proyek Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Klik "Start your project"
3. Login atau daftar akun
4. Klik "New Project"
5. Pilih organization dan isi:
   - **Name**: `pwa-notification-system`
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih yang terdekat dengan lokasi Anda
6. Klik "Create new project"

### 2. Dapatkan Kredensial Supabase
Setelah proyek dibuat, dapatkan kredensial dari dashboard:

1. **Project URL**: `https://your-project-id.supabase.co`
2. **API Keys**:
   - `anon` key (public)
   - `service_role` key (private - untuk backend)

### 3. Setup Database Schema
Jalankan SQL migration di Supabase SQL Editor:

```sql
-- Copy dan paste isi file supabase/migrations/001_create_tables.sql
-- ke Supabase SQL Editor dan execute
```

### 4. Konfigurasi Environment Variables
Update file `.env` di folder backend:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# VAPID Keys for Web Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com

# WhatsApp API Configuration (Optional)
WHATSAPP_API_KEY=your_whatsapp_api_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 5. Install Dependencies
```bash
cd backend
npm install @supabase/supabase-js
```

### 6. Buat Admin Master
```bash
cd backend
node create-admin-supabase.js
```

### 7. Test Koneksi
```bash
cd backend
npm start
```

Jika berhasil, Anda akan melihat:
```
Connected to Supabase PostgreSQL
Users table has 1 records
Server running on port 5000
```

## 🔧 Konfigurasi Row Level Security (RLS)

Supabase menggunakan Row Level Security untuk keamanan data. Policies sudah dikonfigurasi dalam migration:

### Users Table
- Admin dapat mengakses semua data
- Client hanya dapat mengakses data mereka sendiri

### Notifications Table
- Admin dapat mengakses semua notifikasi
- Client hanya dapat mengakses notifikasi mereka

### Subscriptions Table
- Admin dapat mengakses semua subscription
- Client hanya dapat mengakses subscription mereka

### OTP Codes Table
- Admin dapat mengakses semua OTP
- Client hanya dapat mengakses OTP mereka

## 📊 Monitoring dan Logs

### Supabase Dashboard
- **Database**: Lihat tabel dan data
- **Authentication**: Kelola user authentication
- **Storage**: File storage (jika diperlukan)
- **Edge Functions**: Serverless functions
- **Logs**: Real-time logs dan monitoring

### Query Performance
- Gunakan Supabase dashboard untuk monitoring query
- Index sudah dibuat untuk performa optimal
- Monitor slow queries di dashboard

## 🚀 Deployment ke Vercel

### Environment Variables untuk Production
Di Vercel dashboard, tambahkan environment variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_production_jwt_secret
VAPID_PUBLIC_KEY=your_production_vapid_public_key
VAPID_PRIVATE_KEY=your_production_vapid_private_key
VAPID_SUBJECT=mailto:your-production-email@example.com
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
```

### Vercel Configuration
Buat file `vercel.json` di root project:

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
      "use": "@vercel/next"
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

## 🔒 Keamanan Production

### Database Security
- ✅ RLS policies aktif
- ✅ Service key hanya untuk backend
- ✅ Anon key untuk frontend (jika diperlukan)
- ✅ SSL/TLS encryption

### API Security
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ Rate limiting (via Supabase)
- ✅ Input validation

### Environment Variables
- ✅ Semua secrets di environment variables
- ✅ Tidak ada hardcoded credentials
- ✅ Berbeda untuk development dan production

## 📈 Scaling dan Performance

### Database Scaling
- Supabase otomatis handle connection pooling
- Built-in caching untuk query yang sering digunakan
- Auto-scaling berdasarkan usage

### Monitoring
- Real-time metrics di Supabase dashboard
- Query performance monitoring
- Error tracking dan logging

## 💰 Biaya Estimasi

### Supabase Pricing (per bulan)
- **Free Tier**: 
  - 500MB database
  - 2GB bandwidth
  - 50MB file storage
  - Cocok untuk development dan small apps

- **Pro Tier ($25/bulan)**:
  - 8GB database
  - 250GB bandwidth
  - 100GB file storage
  - Daily backups
  - Cocok untuk production apps

### Vercel Pricing
- **Hobby (Free)**: Unlimited personal projects
- **Pro ($20/bulan)**: Commercial projects dengan custom domains

**Total estimasi untuk production: $25-45/bulan**

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test koneksi Supabase
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('YOUR_URL', 'YOUR_KEY');
supabase.from('users').select('count').then(console.log);
"
```

### Migration Issues
- Pastikan SQL migration dijalankan dengan benar
- Check di Supabase dashboard > Database > Tables
- Verifikasi RLS policies aktif

### Authentication Issues
- Pastikan JWT_SECRET sama di semua environment
- Check user roles di database
- Verifikasi RLS policies

## 📞 Support

Jika mengalami masalah:
1. Check Supabase dashboard logs
2. Verifikasi environment variables
3. Test koneksi database
4. Check RLS policies
5. Monitor query performance

---

**Catatan**: Migrasi dari MongoDB ke Supabase PostgreSQL memberikan keuntungan seperti built-in authentication, real-time subscriptions, auto-generated APIs, dan better scaling untuk production deployment.