const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true
  },
  icon_url: {
    type: String,
    default: null
  },
  target_url: {
    type: String,
    default: null
  },
  scheduled_at: {
    type: Date,
    default: null
  },
  sent_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;