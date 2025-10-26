const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class OtpCode {
  constructor(otpData) {
    this.id = otpData.id;
    this.user_id = otpData.user_id;
    this.code = otpData.code;
    this.expires_at = otpData.expires_at;
    this.used = otpData.used;
    this.created_at = otpData.created_at;
  }

  // Static method to create a new OTP code
  static async create(otpData) {
    try {
      // Set expiration time if not provided (default: 5 minutes)
      if (!otpData.expires_at) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        otpData.expires_at = expiresAt.toISOString();
      }

      const { data, error } = await supabase
        .from('otp_codes')
        .insert([otpData])
        .select()
        .single();

      if (error) throw error;
      return new OtpCode(data);
    } catch (error) {
      throw new Error(`Error creating OTP code: ${error.message}`);
    }
  }

  // Static method to generate and create OTP code
  static async generateForUser(userId, expirationMinutes = 5) {
    try {
      // Generate 6-digit OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

      const otpData = {
        user_id: userId,
        code: code,
        expires_at: expiresAt.toISOString(),
        used: false
      };

      return await OtpCode.create(otpData);
    } catch (error) {
      throw new Error(`Error generating OTP code: ${error.message}`);
    }
  }

  // Static method to find OTP code by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('otp_codes')
        .select(`
          *,
          users!otp_codes_user_id_fkey (
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
      return new OtpCode(data);
    } catch (error) {
      throw new Error(`Error finding OTP code by ID: ${error.message}`);
    }
  }

  // Static method to find OTP codes by user ID
  static async findByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('otp_codes')
        .select(`
          *,
          users!otp_codes_user_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(otp => new OtpCode(otp));
    } catch (error) {
      throw new Error(`Error finding OTP codes by user ID: ${error.message}`);
    }
  }

  // Static method to find valid OTP code by user ID and code
  static async findValidCode(userId, code) {
    try {
      const { data, error } = await supabase
        .from('otp_codes')
        .select(`
          *,
          users!otp_codes_user_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .eq('user_id', userId)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return new OtpCode(data);
    } catch (error) {
      throw new Error(`Error finding valid OTP code: ${error.message}`);
    }
  }

  // Static method to find latest unused OTP for user
  static async findLatestUnused(userId) {
    try {
      const { data, error } = await supabase
        .from('otp_codes')
        .select(`
          *,
          users!otp_codes_user_id_fkey (
            id,
            username,
            email,
            whatsapp_number,
            role
          )
        `)
        .eq('user_id', userId)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return new OtpCode(data);
    } catch (error) {
      throw new Error(`Error finding latest unused OTP: ${error.message}`);
    }
  }

  // Static method to verify OTP code
  static async verify(userId, code) {
    try {
      const otpCode = await OtpCode.findValidCode(userId, code);
      
      if (!otpCode) {
        return { success: false, message: 'Invalid or expired OTP code' };
      }

      // Mark as used
      await otpCode.markAsUsed();

      return { success: true, message: 'OTP verified successfully', otpCode };
    } catch (error) {
      throw new Error(`Error verifying OTP code: ${error.message}`);
    }
  }

  // Instance method to check if OTP is valid
  isValid() {
    const now = new Date();
    const expiresAt = new Date(this.expires_at);
    return !this.used && expiresAt > now;
  }

  // Instance method to check if OTP is expired
  isExpired() {
    const now = new Date();
    const expiresAt = new Date(this.expires_at);
    return expiresAt <= now;
  }

  // Instance method to mark OTP as used
  async markAsUsed() {
    try {
      this.used = true;
      return await this.save();
    } catch (error) {
      throw new Error(`Error marking OTP as used: ${error.message}`);
    }
  }

  // Instance method to save/update OTP code
  async save() {
    try {
      if (this.id) {
        // Update existing OTP code
        const { data, error } = await supabase
          .from('otp_codes')
          .update({
            user_id: this.user_id,
            code: this.code,
            expires_at: this.expires_at,
            used: this.used
          })
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      } else {
        // Create new OTP code
        const otpData = {
          user_id: this.user_id,
          code: this.code,
          expires_at: this.expires_at,
          used: this.used
        };

        const { data, error } = await supabase
          .from('otp_codes')
          .insert([otpData])
          .select()
          .single();

        if (error) throw error;
        Object.assign(this, data);
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving OTP code: ${error.message}`);
    }
  }

  // Instance method to delete OTP code
  async delete() {
    try {
      const { error } = await supabase
        .from('otp_codes')
        .delete()
        .eq('id', this.id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting OTP code: ${error.message}`);
    }
  }

  // Static method to delete expired OTP codes
  static async deleteExpired() {
    try {
      const { error } = await supabase
        .from('otp_codes')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting expired OTP codes: ${error.message}`);
    }
  }

  // Static method to delete used OTP codes older than specified days
  static async deleteOldUsed(daysOld = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('otp_codes')
        .delete()
        .eq('used', true)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error deleting old used OTP codes: ${error.message}`);
    }
  }

  // Static method to invalidate all unused OTP codes for a user
  static async invalidateAllForUser(userId) {
    try {
      const { error } = await supabase
        .from('otp_codes')
        .update({ used: true })
        .eq('user_id', userId)
        .eq('used', false);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error invalidating OTP codes for user: ${error.message}`);
    }
  }

  // Static method to count OTP codes
  static async count(criteria = {}) {
    try {
      let query = supabase.from('otp_codes').select('*', { count: 'exact', head: true });

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
      throw new Error(`Error counting OTP codes: ${error.message}`);
    }
  }

  // Convert to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      code: this.code,
      expires_at: this.expires_at,
      used: this.used,
      created_at: this.created_at,
      is_valid: this.isValid(),
      is_expired: this.isExpired()
    };
  }

  // Convert to safe JSON (without sensitive data)
  toSafeJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      expires_at: this.expires_at,
      used: this.used,
      created_at: this.created_at,
      is_valid: this.isValid(),
      is_expired: this.isExpired()
    };
  }
}

module.exports = OtpCode;