# Setup Admin Master (Tanpa WhatsApp)

## 📋 Overview
Dokumentasi ini menjelaskan cara membuat dan menggunakan akun admin master yang menggunakan **username dan email** sebagai pengganti nomor WhatsApp. Sistem ini memisahkan autentikasi admin (username/email) dari client (WhatsApp).

## 🔧 Prasyarat
- Node.js dan npm terinstall
- MongoDB terinstall dan berjalan (atau akses ke MongoDB Atlas)
- Backend dan frontend server berjalan

## 🚀 Cara Membuat Admin Master

### Metode 1: Otomatis (Memerlukan MongoDB Aktif)
```bash
cd backend
node create-admin-master.js
```

### Metode 2: Manual (Tanpa MongoDB)
```bash
cd backend
node create-admin-manual-new.js
```
Script ini akan menghasilkan data admin yang perlu dimasukkan manual ke MongoDB.

## 🔑 Kredensial Login Default

### Admin Master
- **Username**: `admin`
- **Email**: `admin@pwa-notification.com`
- **Password**: `admin123`
- **Role**: `admin_master`
- **Status**: Verified (otomatis)

### URL Login
- **Frontend**: http://localhost:3000/login
- **Pilih**: "Username (Admin)" dari dropdown

## 📝 Langkah-langkah Login

1. Buka http://localhost:3000/login
2. Pilih **"Username (Admin)"** dari dropdown "Tipe Login"
3. Masukkan username: `admin`
4. Masukkan password: `admin123`
5. Klik "Login"

## 🔒 Keamanan

### ⚠️ PENTING - Lakukan Segera Setelah Login Pertama:
1. **Ganti password default** dari `admin123`
2. **Update email** dari `admin@pwa-notification.com` ke email aktual
3. **Jangan bagikan kredensial** kepada siapa pun
4. **Gunakan password yang kuat** (minimal 8 karakter, kombinasi huruf, angka, simbol)

## 🛠️ Troubleshooting

### MongoDB Tidak Berjalan
```bash
# Windows - Coba jalankan:
cd backend
.\start-mongodb.bat

# Atau install MongoDB dari:
# https://www.mongodb.com/try/download/community
```

### Error "Admin already exists"
Admin master sudah dibuat sebelumnya. Gunakan kredensial yang ada atau hapus admin lama dari database.

### Error Login "Invalid credentials"
1. Pastikan memilih "Username (Admin)" dari dropdown
2. Periksa username dan password
3. Pastikan admin master sudah dibuat di database

### Frontend Error
```bash
cd frontend
npm install
npm run dev
```

### Backend Error
```bash
cd backend
npm install
node server.js
```

## 📁 File yang Dibuat

### Scripts
- `create-admin-master.js` - Script otomatis untuk membuat admin
- `create-admin-manual-new.js` - Script manual tanpa koneksi database
- `start-mongodb.bat` - Script untuk memulai MongoDB (Windows)

### Dokumentasi
- `ADMIN-SETUP-NEW.md` - Dokumentasi ini

## 🔄 Perubahan Sistem

### Model User
- **Username**: Wajib untuk admin_master, opsional untuk client
- **Email**: Wajib untuk admin_master, opsional untuk client  
- **WhatsApp**: Opsional untuk admin_master, wajib untuk client
- **Verified**: Default true untuk admin_master

### Authentication Routes
- Mendukung login dengan username, email, atau WhatsApp
- Admin master tidak memerlukan verifikasi OTP
- Client tetap menggunakan verifikasi WhatsApp OTP

### Frontend Login
- Dropdown untuk memilih tipe login
- Form dinamis berdasarkan tipe login
- Informasi kredensial default untuk admin

## 🎯 Fitur Admin Master

### Akses Penuh
- ✅ Dashboard admin
- ✅ Manajemen pengguna
- ✅ Manajemen notifikasi
- ✅ Pengaturan sistem
- ✅ Laporan dan statistik

### Tidak Memerlukan
- ❌ Nomor WhatsApp
- ❌ Verifikasi OTP
- ❌ Registrasi melalui frontend

## 📞 Dukungan

Jika mengalami masalah:
1. Periksa log server backend dan frontend
2. Pastikan MongoDB berjalan
3. Verifikasi konfigurasi .env
4. Periksa koneksi database

## 🔄 Update System

Untuk memperbarui sistem:
1. Backup database terlebih dahulu
2. Update kode backend dan frontend
3. Restart server
4. Test login admin master

---

**Catatan**: Sistem ini memisahkan autentikasi admin dan client untuk keamanan yang lebih baik. Admin menggunakan username/email, sedangkan client menggunakan WhatsApp dengan verifikasi OTP.