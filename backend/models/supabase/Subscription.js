const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class Subscription {
  constructor(subscriptionData) {
    this.id = subscriptionData.id;
    this.client_id = subscriptionData.client_id;
    this.endpoint = subscriptionData.endpoint;
    this.p256dh_key = subscriptionData.p256dh_key;
    this.auth_key = subscriptionData.auth_key;
    this.created_at = subscriptionData.created_at;
  }

  // Static method to create a new subscription
  static async create(subscriptionData) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) throw error;
      return new Subscription(data);
    } catch (error) {
      throw new Error(`Error creating subscription: ${error.message}`);
    }
  }

  // Static method to find subscription by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          users!subscriptions_client_id_fkey (
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
      return new Subscription(data);
    } catch (error) {
      throw new Error(`Error finding subscription by ID: ${error.message}`);
    }
  }

  // Static method to find subscriptions by client ID
  static async findByClientId(clientId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          users!subscriptions_client_id_fkey (
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
      return data.map(subscription => new Subscription(subscription));
    } catch (error) {
      throw new Error(`Error finding subscriptions by client ID: ${error.message}`);
    }
  }

  // Static method to find subscription by endpoint
  static async findByEndpoint(endpoint) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          users!subscriptions_client_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .eq('endpoint', endpoint)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return new Subscription(data);
    } catch (error) {
      throw new Error(`Error finding subscription by endpoint: ${error.message}`);
    }
  }

  // Static method to find subscription by client and endpoint
  static async findByClientAndEndpoint(clientId, endpoint) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          users!subscriptions_client_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .eq('client_id', clientId)
        .eq('endpoint', endpoint)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return new Subscription(data);
    } catch (error) {
      throw new Error(`Error finding subscription by client and endpoint: ${error.message}`);
    }
  }

  // Static method to find all subscriptions
  static async findAll(options = {}) {
    try {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          users!subscriptions_client_id_fkey (
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
      return data.map(subscription => new Subscription(subscription));
    } catch (error) {
      throw new Error(`Error finding all subscriptions: ${error.message}`);
    }
  }

  // Static method to find subscriptions by criteria
  static async find(criteria = {}, options = {}) {
    try {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          users!subscriptions_client_id_fkey (
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
      return data.map(subscription => new Subscription(subscription));
    } catch (error) {
      throw new Error(`Error finding subscriptions: ${error.message}`);
    }
  }

  // Instance method to save/update subscription
  async save() {
    try {
      if (this.id) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            client_id: this.client_id,
            endpoint: this.endpoint,
            p256dh_key: this.p256dh_key,
            auth_key: this.auth_key
          })
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      } else {
        // Create new subscription
        const subscriptionData = {
          client_id: this.client_id,
          endpoint: this.endpoint,
          p256dh_key: this.p256dh_key,
          auth_key: this.auth_key
        };

        const { data, error } = await supabase
          .from('subscriptions')
          .insert([subscriptionData])
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving subscription: ${error.message}`);
    }
  }

  // Instance method to delete subscription
  async delete() {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting subscription: ${error.message}`);
    }
  }

  // Static method to delete subscription by endpoint
  static async deleteByEndpoint(endpoint) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('endpoint', endpoint);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting subscription by endpoint: ${error.message}`);
    }
  }

  // Static method to delete subscriptions by client ID
  static async deleteByClientId(clientId) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('client_id', clientId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting subscriptions by client ID: ${error.message}`);
    }
  }

  // Static method to count subscriptions
  static async count(criteria = {}) {
    try {
      let query = supabase.from('subscriptions').select('*', { count: 'exact', head: true });

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
      throw new Error(`Error counting subscriptions: ${error.message}`);
    }
  }

  // Static method to upsert subscription (create or update)
  static async upsert(subscriptionData) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert([subscriptionData], {
          onConflict: 'client_id,endpoint'
        })
        .select()
        .single();

      if (error) throw error;
      return new Subscription(data);
    } catch (error) {
      throw new Error(`Error upserting subscription: ${error.message}`);
    }
  }

  // Convert to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      client_id: this.client_id,
      endpoint: this.endpoint,
      p256dh_key: this.p256dh_key,
      auth_key: this.auth_key,
      created_at: this.created_at
    };
  }

  // Convert to Web Push format
  toWebPushFormat() {
    return {
      endpoint: this.endpoint,
      keys: {
        p256dh: this.p256dh_key,
        auth: this.auth_key
      }
    };
  }
}

module.exports = Subscription;