const bcrypt = require('bcrypt');

async function generateAdminData() {
  try {
    console.log('🔨 Generating admin master account data...');
    console.log('');

    // Admin credentials
    const whatsappNumber = '08123456789';
    const plainPassword = 'admin123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('=== ADMIN MASTER ACCOUNT DATA ===');
    console.log('');
    console.log('📱 WhatsApp Number:', whatsappNumber);
    console.log('🔑 Plain Password:', plainPassword);
    console.log('🔐 Hashed Password:', hashedPassword);
    console.log('👤 Role: admin_master');
    console.log('✅ Verified: true');
    console.log('📅 Created At:', new Date().toISOString());
    console.log('');
    
    console.log('=== MONGODB DOCUMENT ===');
    console.log('Copy and paste this document into your MongoDB collection:');
    console.log('');
    console.log(JSON.stringify({
      role: 'admin_master',
      whatsapp_number: whatsappNumber,
      password_hash: hashedPassword,
      verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }, null, 2));
    console.log('');
    
    console.log('=== MANUAL INSERTION STEPS ===');
    console.log('1. Start MongoDB service:');
    console.log('   - Windows: Start "MongoDB" service from Services');
    console.log('   - Or run: mongod --dbpath "C:\\data\\db"');
    console.log('');
    console.log('2. Open MongoDB Compass or mongo shell');
    console.log('');
    console.log('3. Connect to: mongodb://localhost:27017');
    console.log('');
    console.log('4. Select database: pwa_notification_system');
    console.log('');
    console.log('5. Select collection: users');
    console.log('');
    console.log('6. Insert the document above');
    console.log('');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log('📱 WhatsApp Number: 08123456789');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login URL (Next.js): http://localhost:3000/login');
    console.log('🌐 Admin Dashboard: http://localhost:3000/admin/dashboard');
    console.log('');
    console.log('⚠️  SECURITY NOTICE:');
    console.log('   - Change the default password immediately after login');
    console.log('   - Update the WhatsApp number if needed');
    console.log('   - Keep your admin credentials secure');
    
  } catch (error) {
    console.error('❌ Error generating admin data:', error.message);
  }
}

// Run the script
console.log('🚀 Generating admin master data...');
console.log('');
generateAdminData();