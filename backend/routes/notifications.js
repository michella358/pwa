const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// Conditional import berdasarkan environment
let Notification;
if (process.env.USE_MOCK_MODELS === 'true') {
  console.log('🔧 Using mock Notification model for testing');
  Notification = require('../models/mock/Notification');
} else {
  console.log('🔧 Using Supabase Notification model');
  Notification = require('../models/supabase/Notification');
}
const Subscription = require('../models/supabase/Subscription');
const { verifyToken, isClient, isVerified } = require('../middlewares/auth');

// Get all notifications for a client
router.get('/', verifyToken, isClient, isVerified, async (req, res) => {
  try {
    const notifications = await Notification.findByClientId(req.user.id);
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
});

// Get notification by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is admin or the client who created the notification
    if (req.user.role !== 'admin_master' && 
        notification.client_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ notification });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ message: 'Server error while fetching notification' });
  }
});

// Create and send notification
router.post('/', verifyToken, isClient, isVerified, async (req, res) => {
  try {
    const { title, message, icon_url, target_url, scheduled_at } = req.body;
    
    // Validate input
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    // Create notification
    const notification = new Notification({
      client_id: req.user._id,
      title,
      message,
      icon_url: icon_url || null,
      target_url: target_url || null,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      sent_at: null
    });
    
    await notification.save();
    
    // If not scheduled, send immediately
    if (!scheduled_at) {
      // Get all subscriptions
      const subscriptions = await Subscription.find();
      
      if (subscriptions.length > 0) {
        // Prepare notification payload
        const payload = JSON.stringify({
          title,
          message,
          icon: icon_url || '/icon.png',
          url: target_url || '/',
          notificationId: notification._id
        });
        
        // Send to all subscriptions
        const sendPromises = subscriptions.map(subscription => {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh_key,
              auth: subscription.auth_key
            }
          };
          
          return webpush.sendNotification(pushSubscription, payload)
            .catch(error => {
              console.error('Error sending notification to subscription:', error);
              // If subscription is invalid, we might want to remove it
              if (error.statusCode === 410) {
                return Subscription.deleteOne({ _id: subscription._id });
              }
            });
        });
        
        await Promise.all(sendPromises);
        
        // Update notification as sent
        notification.sent_at = new Date();
        await notification.save();
      }
    }
    
    res.status(201).json({
      message: scheduled_at ? 'Notification scheduled successfully' : 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error while creating notification' });
  }
});

// Delete notification
router.delete('/:id', verifyToken, isClient, isVerified, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is the client who created the notification
    if (notification.client_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Notification.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
});

// Admin route to get all notifications
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin_master') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const notifications = await Notification.findAll();
    
    res.json({ notifications });
  } catch (error) {
    console.error('Admin get notifications error:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
});

// Admin route to send notification to client
router.post('/admin/send', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin_master') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { client_id, title, message, type } = req.body;
    
    // Validate input
    if (!client_id || !title || !message) {
      return res.status(400).json({ message: 'Client ID, title and message are required' });
    }
    
    // Create notification
    const notification = await Notification.create({
      client_id,
      title,
      message,
      type: type || 'info',
      sent_at: new Date().toISOString()
    });
    
    res.status(201).json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Admin send notification error:', error);
    res.status(500).json({ message: 'Server error while sending notification' });
  }
});

module.exports = router;