const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for backend operations
);

class User {
  constructor(userData) {
    this.id = userData.id;
    this.role = userData.role;
    this.username = userData.username;
    this.email = userData.email;
    this.whatsapp_number = userData.whatsapp_number;
    this.password_hash = userData.password_hash;
    this.verified = userData.verified;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Static method to create a new user
  static async create(userData) {
    try {
      // Hash password if provided
      if (userData.password_hash) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(userData.password_hash, salt);
      }

      // Set default verified status for admin_master
      if (userData.role === 'admin_master' && userData.verified === undefined) {
        userData.verified = true;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return new User(data);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Static method to find user by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return new User(data);
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Static method to find user by username
  static async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return new User(data);
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  // Static method to find user by email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return new User(data);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Static method to find user by WhatsApp number
  static async findByWhatsApp(whatsappNumber) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return new User(data);
    } catch (error) {
      throw new Error(`Error finding user by WhatsApp: ${error.message}`);
    }
  }

  // Static method to find user by role
  static async findByRole(role) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role);

      if (error) throw error;
      return data.map(user => new User(user));
    } catch (error) {
      throw new Error(`Error finding users by role: ${error.message}`);
    }
  }

  // Static method to find one user by criteria
  static async findOne(criteria) {
    try {
      let query = supabase.from('users').select('*');

      // Apply criteria
      Object.keys(criteria).forEach(key => {
        query = query.eq(key, criteria[key]);
      });

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return new User(data);
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Static method to find multiple users by criteria
  static async find(criteria = {}) {
    try {
      let query = supabase.from('users').select('*');

      // Apply criteria
      Object.keys(criteria).forEach(key => {
        query = query.eq(key, criteria[key]);
      });

      const { data, error } = await query;

      if (error) throw error;
      return data.map(user => new User(user));
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  // Instance method to save/update user
  async save() {
    try {
      if (this.id) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({
            role: this.role,
            username: this.username,
            email: this.email,
            whatsapp_number: this.whatsapp_number,
            password_hash: this.password_hash,
            verified: this.verified,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      } else {
        // Create new user
        const userData = {
          role: this.role,
          username: this.username,
          email: this.email,
          whatsapp_number: this.whatsapp_number,
          password_hash: this.password_hash,
          verified: this.verified
        };

        // Hash password if provided
        if (userData.password_hash) {
          const salt = await bcrypt.genSalt(10);
          userData.password_hash = await bcrypt.hash(userData.password_hash, salt);
        }

        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  // Instance method to delete user
  async delete() {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Instance method to compare password
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password_hash);
    } catch (error) {
      throw new Error(`Error comparing password: ${error.message}`);
    }
  }

  // Instance method to update password
  async updatePassword(newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password_hash = await bcrypt.hash(newPassword, salt);
      return await this.save();
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // Static method to count users
  static async count(criteria = {}) {
    try {
      let query = supabase.from('users').select('*', { count: 'exact', head: true });

      // Apply criteria
      Object.keys(criteria).forEach(key => {
        query = query.eq(key, criteria[key]);
      });

      const { count, error } = await query;

      if (error) throw error;
      return count;
    } catch (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }
  }

  // Convert to JSON (for API responses)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;