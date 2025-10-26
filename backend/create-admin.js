const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function createAdminMaster() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin master already exists
    const existingAdmin = await User.findOne({ role: 'admin_master' });
    if (existingAdmin) {
      console.log('❌ Admin master already exists!');
      console.log('📱 WhatsApp Number:', existingAdmin.whatsapp_number);
      console.log('🔑 Role:', existingAdmin.role);
      process.exit(1);
    }

    // Admin credentials
    const adminData = {
      whatsapp_number: '08123456789', // Default admin WhatsApp number
      password_hash: 'admin123', // Default password (will be hashed)
      role: 'admin_master',
      verified: true // Admin is automatically verified
    };

    console.log('🔨 Creating admin master account...');
    console.log('📱 WhatsApp Number:', adminData.whatsapp_number);
    console.log('🔑 Default Password: admin123');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');

    // Create new admin user
    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('✅ Admin master account created successfully!');
    console.log('');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log('📱 WhatsApp Number: 08123456789');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login URL (Next.js): http://localhost:3000/login');
    console.log('🌐 Login URL (React SPA): http://localhost:3000/admin/login');
    console.log('');
    console.log('⚠️  SECURITY NOTICE:');
    console.log('   - Change the default password immediately after login');
    console.log('   - Update the WhatsApp number if needed');
    console.log('   - Keep your admin credentials secure');

  } catch (error) {
    console.error('❌ Error creating admin master:', error.message);
    if (error.code === 11000) {
      console.error('📱 WhatsApp number already exists in database');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
console.log('🚀 Starting admin master creation...');
console.log('');
createAdminMaster();