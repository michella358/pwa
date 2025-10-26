// Supabase Models Export
// This file exports all Supabase models for easy importing

const User = require('./User');
const Notification = require('./Notification');
const Subscription = require('./Subscription');
const OtpCode = require('./OtpCode');

module.exports = {
  User,
  Notification,
  Subscription,
  OtpCode
};