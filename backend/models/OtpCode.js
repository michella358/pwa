const mongoose = require('mongoose');

const otpCodeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    maxlength: 10
  },
  expires_at: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
});

// Index to automatically expire OTP codes
otpCodeSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const OtpCode = mongoose.model('OtpCode', otpCodeSchema);

module.exports = OtpCode;