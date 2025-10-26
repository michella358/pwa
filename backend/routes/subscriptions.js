const express = require('express');
const router = express.Router();
const Subscription = require('../models/supabase/Subscription');
const { verifyToken, isClient, isVerified } = require('../middlewares/auth');

// Subscribe to push notifications
router.post('/', async (req, res) => {
  try {
    const { endpoint, keys, client_id } = req.body;
    
    if (!endpoint || !keys || !keys.p256dh || !keys.auth || !client_id) {
      return res.status(400).json({ message: 'Invalid subscription data' });
    }
    
    // Check if subscription already exists
    let subscription = await Subscription.findByEndpoint(endpoint);
    
    if (subscription) {
      // Update existing subscription
      subscription.p256dh_key = keys.p256dh;
      subscription.auth_key = keys.auth;
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        client_id,
        endpoint,
        p256dh_key: keys.p256dh,
        auth_key: keys.auth
      });
    }
    
    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Server error while saving subscription' });
  }
});

// Provide VAPID public key
router.get('/vapid-public-key', (req, res) => {
  try {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return res.status(500).json({ message: 'VAPID public key not configured' });
    }
    res.json({ vapidPublicKey });
  } catch (error) {
    console.error('Get VAPID key error:', error);
    res.status(500).json({ message: 'Server error while getting VAPID key' });
  }
});

// Get all subscriptions for a client
router.get('/', verifyToken, isClient, isVerified, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ client_id: req.user._id });
    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error while fetching subscriptions' });
  }
});

// Delete subscription
router.delete('/:id', verifyToken, isClient, isVerified, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if user is the client who owns the subscription
    if (subscription.client_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Subscription.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Server error while deleting subscription' });
  }
});

// Admin route to get all subscriptions
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin_master') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const subscriptions = await Subscription.findAll();
    
    res.json({ subscriptions });
  } catch (error) {
    console.error('Admin get subscriptions error:', error);
    res.status(500).json({ message: 'Server error while fetching subscriptions' });
  }
});

module.exports = router;