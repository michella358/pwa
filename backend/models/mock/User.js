const bcrypt = require('bcrypt');

// Mock database untuk testing
let mockUsers = [
  {
    id: 'admin-master-001',
    username: 'admin',
    email: 'admin@pwa-notification.com',
    password_hash: '$2b$10$SpXEnOcXm6W6t4S0oNh13uAzz2oKRa7d7Xq.DYtAu04JQm0GRkgcC', // admin123
    whatsapp_number: null,
    role: 'admin_master',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-001',
    username: null,
    email: null,
    password_hash: '$2b$10$SpXEnOcXm6W6t4S0oNh13uAzz2oKRa7d7Xq.DYtAu04JQm0GRkgcC', // admin123
    whatsapp_number: '+6281234567890',
    role: 'client',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-002',
    username: null,
    email: null,
    password_hash: '$2b$10$SpXEnOcXm6W6t4S0oNh13uAzz2oKRa7d7Xq.DYtAu04JQm0GRkgcC', // admin123
    whatsapp_number: '+6281234567891',
    role: 'client',
    verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

class User {
  constructor(userData) {
    Object.assign(this, userData);
  }

  static async create(userData) {
    console.log('🔧 Mock User.create called with:', userData);
    
    // Hash password jika ada
    if (userData.password) {
      const saltRounds = 10;
      userData.password_hash = await bcrypt.hash(userData.password, saltRounds);
      delete userData.password;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: userData.username || null,
      email: userData.email || null,
      password_hash: userData.password_hash,
      whatsapp_number: userData.whatsapp_number || null,
      role: userData.role || 'client',
      verified: userData.verified || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockUsers.push(newUser);
    console.log('✅ Mock user created:', newUser.id);
    return newUser;
  }

  static async findById(id) {
    console.log('🔧 Mock User.findById called with:', id);
    const userData = mockUsers.find(u => u.id === id);
    console.log('📋 Found user:', userData ? userData.id : 'not found');
    return userData ? new User(userData) : null;
  }

  static async findByUsername(username) {
    console.log('🔧 Mock User.findByUsername called with:', username);
    const userData = mockUsers.find(u => u.username === username);
    console.log('📋 Found user:', userData ? userData.id : 'not found');
    return userData ? new User(userData) : null;
  }

  static async findByEmail(email) {
    console.log('🔧 Mock User.findByEmail called with:', email);
    const userData = mockUsers.find(u => u.email === email);
    console.log('📋 Found user:', userData ? userData.id : 'not found');
    return userData ? new User(userData) : null;
  }

  static async findByWhatsappNumber(whatsappNumber) {
    console.log('🔧 Mock User.findByWhatsappNumber called with:', whatsappNumber);
    const userData = mockUsers.find(u => u.whatsapp_number === whatsappNumber);
    console.log('📋 Found user:', userData ? userData.id : 'not found');
    return userData ? new User(userData) : null;
  }

  static async findByRole(role) {
    console.log('🔧 Mock User.findByRole called with:', role);
    const users = mockUsers.filter(u => u.role === role);
    console.log('📋 Found users:', users.length);
    return users;
  }

  static async findAll() {
    console.log('🔧 Mock User.findAll called');
    console.log('📋 Total users:', mockUsers.length);
    return mockUsers;
  }

  static async findByCriteria(criteria) {
    console.log('🔧 Mock User.findByCriteria called with:', criteria);
    let users = mockUsers;

    if (criteria.role) {
      users = users.filter(u => u.role === criteria.role);
    }
    if (criteria.verified !== undefined) {
      users = users.filter(u => u.verified === criteria.verified);
    }
    if (criteria.username) {
      users = users.filter(u => u.username === criteria.username);
    }
    if (criteria.email) {
      users = users.filter(u => u.email === criteria.email);
    }
    if (criteria.whatsapp_number) {
      users = users.filter(u => u.whatsapp_number === criteria.whatsapp_number);
    }

    console.log('📋 Found users:', users.length);
    return users;
  }

  async save() {
    console.log('🔧 Mock User.save called for:', this.id);
    const index = mockUsers.findIndex(u => u.id === this.id);
    if (index !== -1) {
      this.updated_at = new Date().toISOString();
      mockUsers[index] = { ...this };
      console.log('✅ Mock user updated:', this.id);
      return this;
    }
    throw new Error('User not found');
  }

  static async deleteById(id) {
    console.log('🔧 Mock User.deleteById called with:', id);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      const deletedUser = mockUsers.splice(index, 1)[0];
      console.log('✅ Mock user deleted:', id);
      return deletedUser;
    }
    return null;
  }

  static async count() {
    console.log('🔧 Mock User.count called');
    const count = mockUsers.length;
    console.log('📊 Total users:', count);
    return count;
  }

  static async upsert(userData) {
    console.log('🔧 Mock User.upsert called with:', userData);
    
    // Cari user berdasarkan kriteria unik
    let existingUser = null;
    if (userData.id) {
      existingUser = await this.findById(userData.id);
    } else if (userData.username) {
      existingUser = await this.findByUsername(userData.username);
    } else if (userData.email) {
      existingUser = await this.findByEmail(userData.email);
    } else if (userData.whatsapp_number) {
      existingUser = await this.findByWhatsappNumber(userData.whatsapp_number);
    }

    if (existingUser) {
      // Update existing user
      Object.assign(existingUser, userData);
      existingUser.updated_at = new Date().toISOString();
      console.log('✅ Mock user updated via upsert:', existingUser.id);
      return existingUser;
    } else {
      // Create new user
      return await this.create(userData);
    }
  }

  // Method untuk testing - reset mock data
  static resetMockData() {
    console.log('🔄 Resetting mock user data...');
    mockUsers = [
      {
        id: 'admin-master-001',
        username: 'admin',
        email: 'admin@pwa-notification.com',
        password_hash: '$2b$10$rQJ8vQJ8vQJ8vQJ8vQJ8vOJ8vQJ8vQJ8vQJ8vQJ8vQJ8vQJ8vQJ8vQ',
        whatsapp_number: null,
        role: 'admin_master',
        verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Method untuk compare password
  async comparePassword(password) {
    console.log('🔧 Mock User.comparePassword called');
    const bcrypt = require('bcrypt');
    // Gunakan password_hash bukan password
    const result = await bcrypt.compare(password, this.password_hash || this.password);
    console.log('🔐 Password comparison result:', result);
    return result;
  }

  // Method untuk testing - get mock data
  static getMockData() {
    return [...mockUsers];
  }

  // Method untuk testing - add mock user
  static addMockUser(userData) {
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      ...userData,
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }
}

// Initialize dengan password yang sudah di-hash untuk admin
async function initializeMockData() {
  const adminPassword = 'admin123';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
  
  // Update admin password hash
  const adminIndex = mockUsers.findIndex(u => u.username === 'admin');
  if (adminIndex !== -1) {
    mockUsers[adminIndex].password_hash = hashedPassword;
  }
  
  console.log('🔧 Mock User model initialized with hashed passwords');
}

// Initialize saat module di-load
initializeMockData();

module.exports = User;