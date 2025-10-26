require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdminMaster() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin master already exists
    const existingAdmin = await User.findOne({ role: 'admin_master' });
    
    if (existingAdmin) {
      console.log('Admin master already exists:');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Verified:', existingAdmin.verified);
      console.log('\n--- LOGIN CREDENTIALS ---');
      console.log('Username: ' + existingAdmin.username);
      console.log('Password: admin123 (default password)');
      console.log('Login URL: http://localhost:3000/login');
      console.log('\n⚠️  SECURITY WARNING: Please change the default password after first login!');
      return;
    }

    // Create new admin master
    const adminData = {
      username: 'admin',
      email: 'admin@pwa-notification.com',
      password: 'admin123',
      role: 'admin_master',
      verified: true
    };

    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('✅ Admin master created successfully!');
    console.log('\n--- ADMIN MASTER DETAILS ---');
    console.log('ID:', adminUser._id);
    console.log('Username:', adminUser.username);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Verified:', adminUser.verified);
    console.log('Created At:', adminUser.createdAt);

    console.log('\n--- LOGIN CREDENTIALS ---');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Login URL: http://localhost:3000/login');

    console.log('\n--- SECURITY INSTRUCTIONS ---');
    console.log('⚠️  IMPORTANT: Change the default password immediately after first login!');
    console.log('⚠️  IMPORTANT: Update the email address to your actual email!');
    console.log('⚠️  IMPORTANT: This admin has full access to the system!');

    console.log('\n--- NEXT STEPS ---');
    console.log('1. Start the backend server: node server.js');
    console.log('2. Start the frontend server: npm run dev (in frontend directory)');
    console.log('3. Open http://localhost:3000/login');
    console.log('4. Login with username "admin" and password "admin123"');
    console.log('5. Change password and update profile information');

  } catch (error) {
    console.error('Error creating admin master:', error.message);
    
    if (error.code === 11000) {
      console.log('\n--- DUPLICATE KEY ERROR ---');
      if (error.keyPattern?.username) {
        console.log('Username "admin" already exists. Admin master might already be created.');
      }
      if (error.keyPattern?.email) {
        console.log('Email "admin@pwa-notification.com" already exists. Admin master might already be created.');
      }
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the script
createAdminMaster();