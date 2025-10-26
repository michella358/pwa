const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const webpush = require('web-push');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Web Push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test connection
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Connected to Supabase PostgreSQL');
      console.log(`Users table has ${count} records`);
    }
  });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const subscriptionRoutes = require('./routes/subscriptions');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('PWA Notification System API is running with Supabase');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});