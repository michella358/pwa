-- PWA Notification System - Supabase Migration
-- Migrasi dari MongoDB ke PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin_master', 'client')),
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  whatsapp_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints untuk memastikan field yang diperlukan ada
  CONSTRAINT username_required_for_admin CHECK (
    (role = 'admin_master' AND username IS NOT NULL) OR 
    (role = 'client')
  ),
  CONSTRAINT email_required_for_admin CHECK (
    (role = 'admin_master' AND email IS NOT NULL) OR 
    (role = 'client')
  ),
  CONSTRAINT whatsapp_required_for_client CHECK (
    (role = 'client' AND whatsapp_number IS NOT NULL) OR 
    (role = 'admin_master')
  )
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  icon_url VARCHAR(500),
  target_url VARCHAR(500),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint untuk mencegah duplikasi subscription
  UNIQUE(client_id, endpoint)
);

-- Create otp_codes table
CREATE TABLE otp_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes untuk performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_whatsapp ON users(whatsapp_number);
CREATE INDEX idx_notifications_client_id ON notifications(client_id);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at pada users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert admin master default
INSERT INTO users (
  role, 
  username, 
  email, 
  password_hash, 
  verified
) VALUES (
  'admin_master',
  'admin',
  'admin@pwa-notification.com',
  '$2b$10$RQL3QK68CrTVJfZlOie1z.6MgyDNl5Hqxtva49kR30y.fo4yTlU.2', -- admin123
  true
) ON CONFLICT (username) DO NOTHING;

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy untuk users: admin dapat melihat semua, client hanya milik sendiri
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin_master')
  );

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin_master')
  );

-- Policy untuk notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    client_id::text = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin_master')
  );

CREATE POLICY "Admin can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin_master')
  );

-- Policy untuk subscriptions
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (
    client_id::text = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin_master')
  );

-- Policy untuk otp_codes
CREATE POLICY "Users can view own OTP codes" ON otp_codes
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin_master')
  );

CREATE POLICY "System can manage OTP codes" ON otp_codes
  FOR ALL USING (true); -- Untuk sistem backend