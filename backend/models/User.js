const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin_master', 'client'],
    required: true
  },
  // Username untuk admin_master, optional untuk client
  username: {
    type: String,
    required: function() {
      return this.role === 'admin_master';
    },
    unique: true,
    sparse: true, // Allows null values to be non-unique
    maxlength: 50
  },
  // Email untuk admin_master, optional untuk client
  email: {
    type: String,
    required: function() {
      return this.role === 'admin_master';
    },
    unique: true,
    sparse: true, // Allows null values to be non-unique
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  // WhatsApp number untuk client, optional untuk admin_master
  whatsapp_number: {
    type: String,
    required: function() {
      return this.role === 'client';
    },
    unique: true,
    sparse: true, // Allows null values to be non-unique
    maxlength: 20
  },
  password_hash: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: function() {
      // Admin master otomatis verified, client perlu verifikasi
      return this.role === 'admin_master';
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;