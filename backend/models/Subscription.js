const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  p256dh_key: {
    type: String,
    required: true
  },
  auth_key: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;