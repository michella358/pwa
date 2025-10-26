// Script untuk menggunakan model mock dan testing API
const path = require('path');

// Set environment variable untuk menggunakan mock models
process.env.USE_MOCK_MODELS = 'true';

console.log('🔧 Setting up mock models for testing...\n');

// Import mock models
const User = require('./models/mock/User');
const OtpCode = require('./models/mock/OtpCode');
const Notification = require('./models/mock/Notification');

async function setupMockData() {
  console.log('📋 Setting up mock data...\n');

  // Reset semua mock data
  User.resetMockData();
  OtpCode.resetMockData();
  Notification.resetMockData();

  // Tambah admin master
  const adminMaster = User.addMockUser({
    id: 'admin-master-001',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    role: 'admin_master',
    is_verified: true,
    phone: '+6281234567890'
  });

  // Tambah beberapa client
  const client1 = User.addMockUser({
    id: 'user-001',
    username: 'client1',
    email: 'client1@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    role: 'client',
    is_verified: true,
    phone: '+6281234567891'
  });

  const client2 = User.addMockUser({
    id: 'user-002',
    username: 'client2',
    email: 'client2@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    role: 'client',
    is_verified: false,
    phone: '+6281234567892'
  });

  // Tambah OTP untuk client yang belum verified
  OtpCode.addMockOtp({
    id: 'otp-001',
    user_id: 'user-002',
    code: '123456',
    type: 'phone_verification',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 menit dari sekarang
  });

  // Tambah beberapa notifikasi
  Notification.addMockNotification({
    id: 'notif-001',
    client_id: 'user-001',
    title: 'Welcome!',
    message: 'Selamat datang di PWA Notification System',
    type: 'info'
  });

  Notification.addMockNotification({
    id: 'notif-002',
    client_id: 'user-001',
    title: 'Update Available',
    message: 'Ada update baru untuk aplikasi Anda',
    type: 'update'
  });

  console.log('✅ Mock data setup completed!\n');

  // Display summary
  console.log('📊 MOCK DATA SUMMARY:');
  console.log('='.repeat(50));
  console.log(`👥 Users: ${User.getMockData().length}`);
  console.log(`🔐 OTP Codes: ${OtpCode.getMockData().length}`);
  console.log(`📢 Notifications: ${Notification.getMockData().length}`);
  console.log('='.repeat(50));

  console.log('\n👤 ADMIN MASTER CREDENTIALS:');
  console.log('Username: admin');
  console.log('Password: admin123');
  console.log('Email: admin@example.com');
  console.log('Role: admin_master');

  console.log('\n👥 CLIENT CREDENTIALS:');
  console.log('Client 1 - Username: client1, Password: admin123 (Verified)');
  console.log('Client 2 - Username: client2, Password: admin123 (Not Verified, OTP: 123456)');

  console.log('\n🧪 TESTING ENDPOINTS:');
  console.log('='.repeat(50));
  console.log('Base URL: http://localhost:5000');
  console.log('\n📝 Authentication:');
  console.log('POST /api/auth/login - Login admin/client');
  console.log('POST /api/auth/register - Register new client');
  console.log('POST /api/auth/verify-otp - Verify OTP code');
  console.log('\n👥 Users Management (Admin only):');
  console.log('GET /api/users - Get all users');
  console.log('POST /api/users - Create new user');
  console.log('GET /api/users/:id - Get user by ID');
  console.log('PUT /api/users/:id - Update user');
  console.log('DELETE /api/users/:id - Delete user');
  console.log('\n📢 Notifications:');
  console.log('GET /api/notifications - Get notifications');
  console.log('POST /api/notifications - Send notification');
  console.log('GET /api/notifications/:id - Get notification by ID');
  console.log('DELETE /api/notifications/:id - Delete notification');

  console.log('\n🔧 CURL TESTING COMMANDS:');
  console.log('='.repeat(50));
  
  console.log('\n1. Test Admin Login:');
  console.log(`Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'`);
  
  console.log('\n2. Test Client Login:');
  console.log(`Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"client1","password":"admin123"}'`);
  
  console.log('\n3. Test Get All Users (need admin token):');
  console.log(`Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method GET -Headers @{"Authorization"="Bearer YOUR_ADMIN_TOKEN"}`);
  
  console.log('\n4. Test Get Notifications:');
  console.log(`Invoke-WebRequest -Uri "http://localhost:5000/api/notifications" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}`);
  
  console.log('\n5. Test Send Notification (admin only):');
  console.log(`Invoke-WebRequest -Uri "http://localhost:5000/api/notifications" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_ADMIN_TOKEN"} -Body '{"title":"Test","message":"Test notification","client_id":"user-001","type":"info"}'`);

  console.log('\n📱 FRONTEND TESTING:');
  console.log('='.repeat(50));
  console.log('1. Start frontend: cd frontend && npm start');
  console.log('2. Open: http://localhost:3000');
  console.log('3. Test admin panel: http://localhost:3000/admin');
  console.log('4. Test client panel: http://localhost:3000/client');

  console.log('\n⚠️  IMPORTANT NOTES:');
  console.log('='.repeat(50));
  console.log('- Server harus running di terminal lain (npm start)');
  console.log('- Mock models akan digunakan otomatis saat USE_MOCK_MODELS=true');
  console.log('- Data akan reset setiap kali server restart');
  console.log('- Untuk production, ganti ke Supabase models');

  console.log('\n🚀 Ready for testing! Server should be running on http://localhost:5000');
}

// Jalankan setup
setupMockData().catch(console.error);