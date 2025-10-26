require('dotenv').config();
const bcrypt = require('bcrypt');

async function generateAdminMasterData() {
  try {
    console.log('🔧 Generating Admin Master Data (No Database Required)');
    console.log('=' .repeat(60));

    // Admin master data
    const adminData = {
      username: 'admin',
      email: 'admin@pwa-notification.com',
      password: 'admin123',
      role: 'admin_master',
      verified: true
    };

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Generate timestamps
    const now = new Date();
    
    // Create MongoDB document
    const mongoDocument = {
      username: adminData.username,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      verified: adminData.verified,
      createdAt: now,
      updatedAt: now
    };

    console.log('\n📋 ADMIN MASTER DOCUMENT FOR MONGODB:');
    console.log('-'.repeat(50));
    console.log(JSON.stringify(mongoDocument, null, 2));

    console.log('\n📝 MANUAL DATABASE INSERTION STEPS:');
    console.log('-'.repeat(50));
    console.log('1. Start MongoDB (if not running):');
    console.log('   - Install MongoDB from: https://www.mongodb.com/try/download/community');
    console.log('   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('');
    console.log('2. Connect to MongoDB:');
    console.log('   mongosh "' + process.env.MONGODB_URI + '"');
    console.log('');
    console.log('3. Switch to your database:');
    console.log('   use pwa_notification_db');
    console.log('');
    console.log('4. Insert the admin master document:');
    console.log('   db.users.insertOne(' + JSON.stringify(mongoDocument, null, 2) + ')');
    console.log('');
    console.log('5. Verify insertion:');
    console.log('   db.users.findOne({role: "admin_master"})');

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('-'.repeat(50));
    console.log('Username: ' + adminData.username);
    console.log('Password: ' + adminData.password);
    console.log('Login URL: http://localhost:3000/login');

    console.log('\n⚠️  SECURITY WARNINGS:');
    console.log('-'.repeat(50));
    console.log('• Change the default password immediately after first login!');
    console.log('• Update the email address to your actual email!');
    console.log('• This admin has full access to the system!');
    console.log('• Never share these credentials!');

    console.log('\n🚀 NEXT STEPS:');
    console.log('-'.repeat(50));
    console.log('1. Insert the document into MongoDB (see steps above)');
    console.log('2. Start backend server: node server.js');
    console.log('3. Start frontend server: npm run dev (in frontend directory)');
    console.log('4. Open http://localhost:3000/login');
    console.log('5. Login with username "admin" and password "admin123"');
    console.log('6. Change password and update profile information');

    console.log('\n✅ Admin master data generated successfully!');

  } catch (error) {
    console.error('❌ Error generating admin master data:', error.message);
  }
}

// Run the script
generateAdminMasterData();