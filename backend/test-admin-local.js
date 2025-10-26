const bcrypt = require('bcrypt');

// Mock admin data untuk testing
const mockAdmin = {
  id: 'admin-master-001',
  username: 'admin',
  email: 'admin@pwa-notification.com',
  password_hash: '',
  role: 'admin_master',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock users data untuk testing
const mockUsers = [
  {
    id: 'user-001',
    whatsapp_number: '+6281234567890',
    role: 'client',
    verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'user-002', 
    whatsapp_number: '+6281234567891',
    role: 'client',
    verified: false,
    created_at: new Date().toISOString()
  }
];

// Mock notifications data
const mockNotifications = [
  {
    id: 'notif-001',
    client_id: 'user-001',
    title: 'Welcome!',
    message: 'Selamat datang di PWA Notification System',
    type: 'info',
    sent_at: new Date().toISOString()
  },
  {
    id: 'notif-002',
    client_id: 'user-001', 
    title: 'Update Available',
    message: 'Ada update baru untuk aplikasi Anda',
    type: 'update',
    sent_at: new Date().toISOString()
  }
];

async function createMockAdmin() {
  console.log('🚀 Creating Mock Admin Master for Testing...\n');
  
  try {
    // Hash password
    console.log('🔐 Hashing password...');
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    mockAdmin.password_hash = hashedPassword;
    
    console.log('✅ Mock Admin Master created successfully!\n');
    
    console.log('📋 Admin Master Details:');
    console.log('========================');
    console.log(`ID: ${mockAdmin.id}`);
    console.log(`Username: ${mockAdmin.username}`);
    console.log(`Email: ${mockAdmin.email}`);
    console.log(`Role: ${mockAdmin.role}`);
    console.log(`Password: ${password}`);
    console.log(`Created: ${mockAdmin.created_at}\n`);
    
    console.log('👥 Mock Users Data:');
    console.log('==================');
    mockUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   WhatsApp: ${user.whatsapp_number}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.verified ? '✅' : '❌'}\n`);
    });
    
    console.log('📢 Mock Notifications:');
    console.log('======================');
    mockNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Client: ${notif.client_id}\n`);
    });
    
    console.log('🔗 Testing URLs:');
    console.log('================');
    console.log('Backend API: http://localhost:5000');
    console.log('Admin Panel: http://localhost:3000/admin');
    console.log('Client Panel: http://localhost:3000/client\n');
    
    console.log('🧪 Test API Endpoints:');
    console.log('======================');
    console.log('POST /api/auth/login - Admin login');
    console.log('GET  /api/users - Get all users (admin only)');
    console.log('POST /api/notifications - Send notification (admin only)');
    console.log('POST /api/auth/register - Client registration');
    console.log('POST /api/auth/verify-otp - Verify OTP\n');
    
    console.log('📱 Testing Steps:');
    console.log('=================');
    console.log('1. Test Admin Login:');
    console.log('   curl -X POST http://localhost:5000/api/auth/login \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log(`   -d '{"username":"${mockAdmin.username}","password":"${password}"}'\n`);
    
    console.log('2. Test Client Registration:');
    console.log('   curl -X POST http://localhost:5000/api/auth/register \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"whatsapp_number":"+6281234567892","password":"client123"}\'\n');
    
    console.log('3. Start Frontend for UI Testing:');
    console.log('   cd ../frontend && npm run dev\n');
    
    return {
      admin: mockAdmin,
      users: mockUsers,
      notifications: mockNotifications
    };
    
  } catch (error) {
    console.error('❌ Error creating mock admin:', error);
    process.exit(1);
  }
}

// Export untuk digunakan di testing
module.exports = {
  mockAdmin,
  mockUsers,
  mockNotifications,
  createMockAdmin
};

// Jalankan jika dipanggil langsung
if (require.main === module) {
  createMockAdmin();
}