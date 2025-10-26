# 🔐 Setup Akun Admin Master

Panduan lengkap untuk membuat akun admin master utama pada sistem PWA Notification.

## 📋 Prasyarat

1. **MongoDB** harus terinstall dan berjalan
2. **Node.js** dan **npm** terinstall
3. Backend dependencies sudah terinstall (`npm install`)

## 🚀 Cara 1: Otomatis (Recommended)

### 1. Start MongoDB

**Opsi A: Menggunakan script batch (Windows)**
```bash
cd backend
start-mongodb.bat
```

**Opsi B: Manual**
```bash
# Start MongoDB service (jika terinstall sebagai service)
net start MongoDB

# Atau start manual
mongod --dbpath "C:\data\db"
```

### 2. Jalankan Script Pembuatan Admin

```bash
cd backend
node create-admin.js
```

Script akan:
- ✅ Membuat akun admin master otomatis
- 🔐 Hash password dengan bcrypt
- 📱 Set nomor WhatsApp default: `08123456789`
- 🔑 Set password default: `admin123`
- ✅ Set status verified: `true`

## 🛠️ Cara 2: Manual (Jika MongoDB tidak bisa diakses)

### 1. Generate Data Admin

```bash
cd backend
node create-admin-manual.js
```

### 2. Copy Document ke MongoDB

Script akan menghasilkan document JSON seperti ini:

```json
{
  "role": "admin_master",
  "whatsapp_number": "08123456789",
  "password_hash": "$2b$10$RQL3QK68CrTVJfZlOie1z.6MgyDNl5Hqxtva49kR30y.fo4yTlU.2",
  "verified": true,
  "created_at": "2025-10-20T17:58:56.979Z",
  "updated_at": "2025-10-20T17:58:56.979Z"
}
```

### 3. Insert ke Database

**Menggunakan MongoDB Compass:**
1. Buka MongoDB Compass
2. Connect ke `mongodb://localhost:27017`
3. Pilih database: `pwa_notification_system`
4. Pilih collection: `users`
5. Klik "Insert Document"
6. Paste document JSON di atas

**Menggunakan Mongo Shell:**
```bash
mongo
use pwa_notification_system
db.users.insertOne({
  "role": "admin_master",
  "whatsapp_number": "08123456789",
  "password_hash": "$2b$10$RQL3QK68CrTVJfZlOie1z.6MgyDNl5Hqxtva49kR30y.fo4yTlU.2",
  "verified": true,
  "created_at": new Date(),
  "updated_at": new Date()
})
```

## 🔑 Kredensial Login Default

| Field | Value |
|-------|-------|
| **WhatsApp Number** | `08123456789` |
| **Password** | `admin123` |
| **Role** | `admin_master` |
| **Status** | `verified` |

## 🌐 URL Login

### Next.js App Router
```
http://localhost:3000/login
```

### React SPA (jika ada)
```
http://localhost:3000/admin/login
```

### Admin Dashboard
```
http://localhost:3000/admin/dashboard
```

## ✅ Verifikasi Login

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # atau
   node server.js
   ```

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Buka Browser**
   - Kunjungi: `http://localhost:3000/login`
   - Masukkan WhatsApp: `08123456789`
   - Masukkan Password: `admin123`
   - Klik Login

4. **Verifikasi Redirect**
   - Seharusnya redirect ke: `http://localhost:3000/admin/dashboard`
   - Navbar menampilkan menu admin
   - Dashboard menampilkan fitur admin

## 🔒 Keamanan

### ⚠️ PENTING: Ganti Password Default!

Setelah login pertama kali:

1. **Ganti Password**
   - Buka profil admin
   - Update password dari `admin123` ke password yang kuat

2. **Update WhatsApp Number**
   - Ganti dari `08123456789` ke nomor WhatsApp admin yang sebenarnya

3. **Verifikasi Environment Variables**
   ```bash
   # backend/.env
   JWT_SECRET=your_strong_jwt_secret_key
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED ::1:27017
```

**Solusi:**
1. Pastikan MongoDB berjalan: `mongod --dbpath "C:\data\db"`
2. Check port 27017 tidak digunakan aplikasi lain
3. Restart MongoDB service

### Admin Already Exists
```
❌ Admin master already exists!
```

**Solusi:**
1. Login dengan kredensial yang ada
2. Atau hapus admin lama dari database:
   ```bash
   mongo
   use pwa_notification_system
   db.users.deleteOne({"role": "admin_master"})
   ```

### Login Failed
```
Invalid credentials
```

**Solusi:**
1. Pastikan backend server berjalan
2. Check database connection
3. Verifikasi password hash di database
4. Check browser console untuk error

## 📁 File yang Dibuat

- `backend/create-admin.js` - Script otomatis pembuatan admin
- `backend/create-admin-manual.js` - Script manual generate data admin
- `backend/start-mongodb.bat` - Script start MongoDB (Windows)
- `ADMIN-SETUP.md` - Dokumentasi ini

## 🎯 Fitur Admin Master

Setelah login sebagai admin master, Anda dapat:

- 📊 **Dashboard Admin** - Overview sistem
- 👥 **Manajemen User** - CRUD users dan clients
- 📱 **Manajemen Notifikasi** - Kirim push notifications
- 📋 **Manajemen Subscription** - Kelola push subscriptions
- ⚙️ **Pengaturan Sistem** - Konfigurasi aplikasi

---

**🔐 Keamanan adalah prioritas utama. Selalu ganti kredensial default setelah setup!**