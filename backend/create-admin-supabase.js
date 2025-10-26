const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createAdminMaster() {
  try {
    console.log('🚀 Creating Admin Master for Supabase...\n');

    // Admin data
    const adminData = {
      role: 'admin_master',
      username: 'admin',
      email: 'admin@pwa-notification.com',
      password: 'admin123',
      verified: true
    };

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`username.eq.${adminData.username},email.eq.${adminData.email}`)
      .single();

    if (existingAdmin && !checkError) {
      console.log('❌ Admin master already exists!');
      console.log('Existing admin:', {
        id: existingAdmin.id,
        username: existingAdmin.username,
        email: existingAdmin.email
      });
      console.log('\n💡 Use existing credentials or delete the admin from Supabase dashboard first.');
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Insert admin into Supabase
    console.log('📝 Inserting admin master into Supabase...');
    const { data: newAdmin, error: insertError } = await supabase
      .from('users')
      .insert([{
        role: adminData.role,
        username: adminData.username,
        email: adminData.email,
        password_hash: hashedPassword,
        verified: adminData.verified,
        whatsapp_number: null
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin master:', insertError);
      return;
    }

    console.log('✅ Admin master created successfully!\n');

    // Display admin information
    console.log('👤 ADMIN MASTER INFORMATION:');
    console.log('-'.repeat(50));
    console.log('ID:', newAdmin.id);
    console.log('Username:', newAdmin.username);
    console.log('Email:', newAdmin.email);
    console.log('Role:', newAdmin.role);
    console.log('Verified:', newAdmin.verified);
    console.log('Created:', new Date(newAdmin.created_at).toLocaleString());

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('-'.repeat(50));
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Login URL: http://localhost:3000/login');

    console.log('\n⚠️  SECURITY WARNINGS:');
    console.log('-'.repeat(50));
    console.log('• Change the default password immediately after first login!');
    console.log('• Update the email address to your actual email!');
    console.log('• This admin has full access to the system!');
    console.log('• Never share these credentials!');

    console.log('\n🚀 NEXT STEPS:');
    console.log('-'.repeat(50));
    console.log('1. Start backend server: npm start');
    console.log('2. Start frontend server: npm run dev (in frontend directory)');
    console.log('3. Open http://localhost:3000/login');
    console.log('4. Select "Admin (Email)" from login type dropdown');
    console.log('5. Login with email "admin@pwa-notification.com" and password "admin123"');
    console.log('6. Change password and update profile information');

    console.log('\n✅ Admin master setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating admin master:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Check if required environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

// Run the script
createAdminMaster();