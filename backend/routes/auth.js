const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Conditional import berdasarkan environment
let User, OtpCode;
if (process.env.USE_MOCK_MODELS === 'true') {
  console.log('🔧 Using mock models for testing');
  User = require('../models/mock/User');
  OtpCode = require('../models/mock/OtpCode');
} else {
  console.log('🔧 Using Supabase models');
  User = require('../models/User');
  OtpCode = require('../models/OtpCode');
}
const { verifyToken } = require('../middlewares/auth');

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send WhatsApp OTP (mock implementation)
const sendWhatsAppOTP = async (whatsappNumber, otpCode) => {
  // In a real implementation, this would use Twilio or WhatsApp Business API
  console.log(`Sending OTP ${otpCode} to ${whatsappNumber}`);
  
  // Mock successful sending
  return true;
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { whatsapp_number, password, role = 'client', username, email } = req.body;
    
    // Validate input based on role
    if (role === 'admin_master') {
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required for admin' });
      }
    } else {
      if (!whatsapp_number || !password) {
        return res.status(400).json({ message: 'WhatsApp number and password are required for client' });
      }
    }
    
    // Check if user already exists
    let existingUser = null;
    if (role === 'admin_master') {
      existingUser = await User.findByUsername(username) || await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this username or email already exists' });
      }
    } else {
      existingUser = await User.findByWhatsappNumber(whatsapp_number);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this WhatsApp number already exists' });
      }
    }
    
    // Create new user
    const userData = {
      password: password, // Will be hashed by User.create method
      role
    };
    
    if (role === 'admin_master') {
      userData.username = username;
      userData.email = email;
      userData.verified = true; // Admin otomatis verified
    } else {
      userData.whatsapp_number = whatsapp_number;
      userData.verified = false; // Client perlu verifikasi
    }
    
    const user = await User.create(userData);
    
    // Jika client, generate OTP
    if (role === 'client') {
      const otpCode = generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
      
      // Save OTP to database
      const otp = await OtpCode.create({
        user_id: user.id,
        code: otpCode,
        expires_at: otpExpiry,
        used: false
      });
      
      // Send OTP via WhatsApp
      await sendWhatsAppOTP(whatsapp_number, otpCode);
      
      res.status(201).json({ 
        message: 'User registered successfully. Please verify your WhatsApp number with the OTP sent.',
        userId: user.id
      });
    } else {
      // Admin master langsung bisa login
      res.status(201).json({ 
        message: 'Admin master registered successfully. You can now login.',
        userId: user.id
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otpCode } = req.body;
    
    if (!userId || !otpCode) {
      return res.status(400).json({ message: 'User ID and OTP code are required' });
    }
    
    // Find the latest unused OTP for this user
    const otp = await OtpCode.findByUserId(userId, {
      used: false,
      expires_at: { $gt: new Date() }
    });
    
    if (!otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Verify OTP
    if (otp.code !== otpCode) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Mark OTP as used
    await otp.markAsUsed();
    
    // Mark user as verified
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.verified = true;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'WhatsApp number verified successfully',
      token,
      user: {
        id: user.id,
        whatsapp_number: user.whatsapp_number,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { whatsapp_number, password, username, email } = req.body;
    
    // Validate input - bisa login dengan WhatsApp (client) atau username/email (admin)
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    if (!whatsapp_number && !username && !email) {
      return res.status(400).json({ message: 'WhatsApp number, username, or email is required' });
    }
    
    // Find user berdasarkan input
    let user = null;
    if (whatsapp_number) {
      // Login dengan WhatsApp (untuk client)
      user = await User.findByWhatsappNumber(whatsapp_number);
    } else if (username) {
      // Login dengan username (untuk admin)
      user = await User.findByUsername(username);
    } else if (email) {
      // Login dengan email (untuk admin)
      user = await User.findByEmail(email);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is verified (hanya untuk client)
    if (user.role === 'client' && !user.verified) {
      // Generate new OTP for unverified clients
      const otpCode = generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      
      const otp = await OtpCode.create({
        user_id: user.id,
        code: otpCode,
        expires_at: otpExpiry,
        used: false
      });
      
      // Send OTP via WhatsApp
      await sendWhatsAppOTP(user.whatsapp_number, otpCode);
      
      return res.status(403).json({
        message: 'Account not verified. A new OTP has been sent to your WhatsApp number.',
        userId: user.id,
        requiresVerification: true
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Prepare user data for response
    const userData = {
      id: user.id,
      role: user.role,
      verified: user.verified
    };
    
    if (user.role === 'admin_master') {
      userData.username = user.username;
      userData.email = user.email;
    } else {
      userData.whatsapp_number = user.whatsapp_number;
    }
    
    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
    
    const otp = await OtpCode.create({
      user_id: user.id,
      code: otpCode,
      expires_at: otpExpiry,
      used: false
    });
    
    // Send OTP via WhatsApp
    await sendWhatsAppOTP(user.whatsapp_number, otpCode);
    
    res.json({
      message: 'OTP resent successfully',
      userId: user.id
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        whatsapp_number: req.user.whatsapp_number,
        role: req.user.role,
        verified: req.user.verified,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

module.exports = router;