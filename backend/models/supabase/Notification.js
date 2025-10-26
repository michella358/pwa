const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class Notification {
  constructor(notificationData) {
    this.id = notificationData.id;
    this.client_id = notificationData.client_id;
    this.title = notificationData.title;
    this.message = notificationData.message;
    this.icon_url = notificationData.icon_url;
    this.target_url = notificationData.target_url;
    this.scheduled_at = notificationData.scheduled_at;
    this.sent_at = notificationData.sent_at;
    this.created_at = notificationData.created_at;
  }

  // Static method to create a new notification
  static async create(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return new Notification(data);
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Static method to find notification by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          users!notifications_client_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return new Notification(data);
    } catch (error) {
      throw new Error(`Error finding notification by ID: ${error.message}`);
    }
  }

  // Static method to find notifications by client ID
  static async findByClientId(clientId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          users!notifications_client_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Error finding notifications by client ID: ${error.message}`);
    }
  }

  // Static method to find all notifications
  static async findAll(options = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          users!notifications_client_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `);

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply ordering
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Error finding all notifications: ${error.message}`);
    }
  }

  // Static method to find scheduled notifications
  static async findScheduled() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          users!notifications_client_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .not('scheduled_at', 'is', null)
        .is('sent_at', null)
        .lte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Error finding scheduled notifications: ${error.message}`);
    }
  }

  // Static method to find notifications by criteria
  static async find(criteria = {}, options = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          users!notifications_client_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `);

      // Apply criteria
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== undefined) {
          query = query.eq(key, criteria[key]);
        }
      });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply ordering
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Error finding notifications: ${error.message}`);
    }
  }

  // Instance method to save/update notification
  async save() {
    try {
      if (this.id) {
        // Update existing notification
        const { data, error } = await supabase
          .from('notifications')
          .update({
            client_id: this.client_id,
            title: this.title,
            message: this.message,
            icon_url: this.icon_url,
            target_url: this.target_url,
            scheduled_at: this.scheduled_at,
            sent_at: this.sent_at
          })
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      } else {
        // Create new notification
        const notificationData = {
          client_id: this.client_id,
          title: this.title,
          message: this.message,
          icon_url: this.icon_url,
          target_url: this.target_url,
          scheduled_at: this.scheduled_at,
          sent_at: this.sent_at
        };

        const { data, error } = await supabase
          .from('notifications')
          .insert([notificationData])
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving notification: ${error.message}`);
    }
  }

  // Instance method to mark as sent
  async markAsSent() {
    try {
      this.sent_at = new Date().toISOString();
      return await this.save();
    } catch (error) {
      throw new Error(`Error marking notification as sent: ${error.message}`);
    }
  }

  // Instance method to delete notification
  async delete() {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // Static method to count notifications
  static async count(criteria = {}) {
    try {
      let query = supabase.from('notifications').select('*', { count: 'exact', head: true });

      // Apply criteria
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== undefined) {
          query = query.eq(key, criteria[key]);
        }
      });

      const { count, error } = await query;

      if (error) throw error;
      return count;
    } catch (error) {
      throw new Error(`Error counting notifications: ${error.message}`);
    }
  }

  // Static method to delete old notifications
  static async deleteOld(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting old notifications: ${error.message}`);
    }
  }

  // Convert to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      client_id: this.client_id,
      title: this.title,
      message: this.message,
      icon_url: this.icon_url,
      target_url: this.target_url,
      scheduled_at: this.scheduled_at,
      sent_at: this.sent_at,
      created_at: this.created_at
    };
  }
}

module.exports = Notification;