const express = require('express');
const router = express.Router();

// Conditional import berdasarkan environment
let User;
if (process.env.USE_MOCK_MODELS === 'true') {
  console.log('🔧 Using mock User model for testing');
  User = require('../models/mock/User');
} else {
  console.log('🔧 Using Supabase User model');
  User = require('../models/supabase/User');
}
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Get all users (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findByRole('client');
    
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get user by ID (admin only)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// Create new user (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { whatsapp_number, password, role = 'client' } = req.body;
    
    // Validate input
    if (!whatsapp_number || !password) {
      return res.status(400).json({ message: 'WhatsApp number and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByWhatsappNumber(whatsapp_number);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this WhatsApp number already exists' });
    }
    
    // Create new user
    const user = await User.create({
      whatsapp_number,
      password_hash: password,
      role,
      verified: true // Admin-created users are automatically verified
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        whatsapp_number: user.whatsapp_number,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// Update user (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { whatsapp_number, password, verified } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (whatsapp_number) user.whatsapp_number = whatsapp_number;
    if (password) user.password_hash = password;
    if (verified !== undefined) user.verified = verified;
    
    user.updated_at = Date.now();
    await user.save();
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        whatsapp_number: user.whatsapp_number,
        role: user.role,
        verified: user.verified,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

module.exports = router;