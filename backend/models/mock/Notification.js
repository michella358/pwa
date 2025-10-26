// Mock database untuk notifications
let mockNotifications = [
  {
    id: 'notif-001',
    client_id: 'user-001',
    title: 'Welcome!',
    message: 'Selamat datang di PWA Notification System',
    type: 'info',
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'notif-002',
    client_id: 'user-001',
    title: 'Update Available',
    message: 'Ada update baru untuk aplikasi Anda',
    type: 'update',
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

class Notification {
  constructor(notificationData) {
    Object.assign(this, notificationData);
  }

  static async create(notificationData) {
    console.log('🔧 Mock Notification.create called with:', notificationData);
    
    const newNotification = {
      id: `notif-${Date.now()}`,
      client_id: notificationData.client_id,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      sent_at: notificationData.sent_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockNotifications.push(newNotification);
    console.log('✅ Mock notification created:', newNotification.id);
    return newNotification;
  }

  static async findById(id) {
    console.log('🔧 Mock Notification.findById called with:', id);
    const notification = mockNotifications.find(n => n.id === id);
    console.log('📋 Found notification:', notification ? notification.id : 'not found');
    return notification || null;
  }

  static async findByClientId(clientId) {
    console.log('🔧 Mock Notification.findByClientId called with:', clientId);
    const notifications = mockNotifications.filter(n => n.client_id === clientId);
    console.log('📋 Found notifications:', notifications.length);
    return notifications;
  }

  static async findAll() {
    console.log('🔧 Mock Notification.findAll called');
    console.log('📋 Total notifications:', mockNotifications.length);
    return mockNotifications;
  }

  static async findByCriteria(criteria) {
    console.log('🔧 Mock Notification.findByCriteria called with:', criteria);
    let notifications = mockNotifications;

    if (criteria.client_id) {
      notifications = notifications.filter(n => n.client_id === criteria.client_id);
    }
    if (criteria.type) {
      notifications = notifications.filter(n => n.type === criteria.type);
    }
    if (criteria.title) {
      notifications = notifications.filter(n => n.title.includes(criteria.title));
    }
    if (criteria.message) {
      notifications = notifications.filter(n => n.message.includes(criteria.message));
    }

    console.log('📋 Found notifications:', notifications.length);
    return notifications;
  }

  async save() {
    console.log('🔧 Mock Notification.save called for:', this.id);
    const index = mockNotifications.findIndex(n => n.id === this.id);
    if (index !== -1) {
      this.updated_at = new Date().toISOString();
      mockNotifications[index] = { ...this };
      console.log('✅ Mock notification updated:', this.id);
      return this;
    }
    throw new Error('Notification not found');
  }

  static async deleteById(id) {
    console.log('🔧 Mock Notification.deleteById called with:', id);
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const deletedNotification = mockNotifications.splice(index, 1)[0];
      console.log('✅ Mock notification deleted:', id);
      return deletedNotification;
    }
    return null;
  }

  static async deleteByClientId(clientId) {
    console.log('🔧 Mock Notification.deleteByClientId called with:', clientId);
    const beforeCount = mockNotifications.length;
    mockNotifications = mockNotifications.filter(n => n.client_id !== clientId);
    const deletedCount = beforeCount - mockNotifications.length;
    console.log('✅ Mock notifications deleted:', deletedCount);
    return deletedCount;
  }

  static async count() {
    console.log('🔧 Mock Notification.count called');
    const count = mockNotifications.length;
    console.log('📊 Total notifications:', count);
    return count;
  }

  static async upsert(notificationData) {
    console.log('🔧 Mock Notification.upsert called with:', notificationData);
    
    // Cari notification berdasarkan ID
    let existingNotification = null;
    if (notificationData.id) {
      existingNotification = await this.findById(notificationData.id);
    }

    if (existingNotification) {
      // Update existing notification
      Object.assign(existingNotification, notificationData);
      existingNotification.updated_at = new Date().toISOString();
      console.log('✅ Mock notification updated via upsert:', existingNotification.id);
      return existingNotification;
    } else {
      // Create new notification
      return await this.create(notificationData);
    }
  }

  // Method untuk testing - reset mock data
  static resetMockData() {
    console.log('🔄 Resetting mock notification data...');
    mockNotifications = [
      {
        id: 'notif-001',
        client_id: 'user-001',
        title: 'Welcome!',
        message: 'Selamat datang di PWA Notification System',
        type: 'info',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Method untuk testing - get mock data
  static getMockData() {
    return [...mockNotifications];
  }

  // Method untuk testing - add mock notification
  static addMockNotification(notificationData) {
    const newNotification = {
      id: notificationData.id || `notif-${Date.now()}`,
      ...notificationData,
      created_at: notificationData.created_at || new Date().toISOString(),
      updated_at: notificationData.updated_at || new Date().toISOString()
    };
    mockNotifications.push(newNotification);
    return newNotification;
  }

  // Method untuk testing - send notification to all clients
  static async sendToAllClients(notificationData) {
    console.log('🔧 Mock Notification.sendToAllClients called with:', notificationData);
    
    // Import User model untuk mendapatkan semua client
    const User = require('./User');
    const clients = await User.findByRole('client');
    
    const notifications = [];
    for (const client of clients) {
      const notification = await this.create({
        ...notificationData,
        client_id: client.id
      });
      notifications.push(notification);
    }
    
    console.log('✅ Mock notifications sent to all clients:', notifications.length);
    return notifications;
  }

  // Method untuk testing - get notifications by type
  static async findByType(type) {
    console.log('🔧 Mock Notification.findByType called with:', type);
    const notifications = mockNotifications.filter(n => n.type === type);
    console.log('📋 Found notifications by type:', notifications.length);
    return notifications;
  }

  // Method untuk testing - get recent notifications
  static async findRecent(limit = 10) {
    console.log('🔧 Mock Notification.findRecent called with limit:', limit);
    const sortedNotifications = mockNotifications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
    console.log('📋 Found recent notifications:', sortedNotifications.length);
    return sortedNotifications;
  }
}

console.log('🔧 Mock Notification model initialized');

module.exports = Notification;