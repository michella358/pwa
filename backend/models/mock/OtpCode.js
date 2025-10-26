// Mock database untuk OTP codes
let mockOtpCodes = [];

class OtpCode {
  constructor(otpData) {
    Object.assign(this, otpData);
  }

  static async create(otpData) {
    console.log('🔧 Mock OtpCode.create called with:', otpData);
    
    const newOtp = {
      id: `otp-${Date.now()}`,
      user_id: otpData.user_id,
      code: otpData.code,
      used: false,
      expires_at: otpData.expires_at || new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockOtpCodes.push(newOtp);
    console.log('✅ Mock OTP created:', newOtp.id);
    return newOtp;
  }

  static async findById(id) {
    console.log('🔧 Mock OtpCode.findById called with:', id);
    const otp = mockOtpCodes.find(o => o.id === id);
    console.log('📋 Found OTP:', otp ? otp.id : 'not found');
    return otp || null;
  }

  static async findByUserId(userId) {
    console.log('🔧 Mock OtpCode.findByUserId called with:', userId);
    const otps = mockOtpCodes.filter(o => o.user_id === userId && !o.used);
    console.log('📋 Found OTPs:', otps.length);
    if (otps.length > 0) {
      const latestOtp = otps[otps.length - 1];
      return new OtpCode(latestOtp); // Return instance of OtpCode class
    }
    return null;
  }

  static async findByCode(code) {
    console.log('🔧 Mock OtpCode.findByCode called with:', code);
    const otp = mockOtpCodes.find(o => o.code === code && !o.used);
    console.log('📋 Found OTP:', otp ? otp.id : 'not found');
    return otp || null;
  }

  static async findByCriteria(criteria) {
    console.log('🔧 Mock OtpCode.findByCriteria called with:', criteria);
    let otps = mockOtpCodes;

    if (criteria.user_id) {
      otps = otps.filter(o => o.user_id === criteria.user_id);
    }
    if (criteria.code) {
      otps = otps.filter(o => o.code === criteria.code);
    }
    if (criteria.used !== undefined) {
      otps = otps.filter(o => o.used === criteria.used);
    }

    console.log('📋 Found OTPs:', otps.length);
    return otps;
  }

  async save() {
    console.log('🔧 Mock OtpCode.save called for:', this.id);
    const index = mockOtpCodes.findIndex(o => o.id === this.id);
    if (index !== -1) {
      this.updated_at = new Date().toISOString();
      mockOtpCodes[index] = { ...this };
      console.log('✅ Mock OTP updated:', this.id);
      return this;
    }
    throw new Error('OTP not found');
  }

  async markAsUsed() {
    console.log('🔧 Mock OtpCode.markAsUsed called for:', this.id);
    this.used = true;
    this.updated_at = new Date().toISOString();
    return await this.save();
  }

  static async deleteById(id) {
    console.log('🔧 Mock OtpCode.deleteById called with:', id);
    const index = mockOtpCodes.findIndex(o => o.id === id);
    if (index !== -1) {
      const deletedOtp = mockOtpCodes.splice(index, 1)[0];
      console.log('✅ Mock OTP deleted:', id);
      return deletedOtp;
    }
    return null;
  }

  static async verify(userId, code) {
    console.log('🔧 Mock OtpCode.verify called with:', { userId, code });
    
    const otp = mockOtpCodes.find(o => 
      o.user_id === userId && 
      o.code === code && 
      !o.used &&
      new Date(o.expires_at) > new Date()
    );

    if (otp) {
      otp.used = true;
      otp.updated_at = new Date().toISOString();
      console.log('✅ Mock OTP verified and marked as used:', otp.id);
      return otp;
    }

    console.log('❌ Mock OTP verification failed');
    return null;
  }

  static async count() {
    console.log('🔧 Mock OtpCode.count called');
    const count = mockOtpCodes.length;
    console.log('📊 Total OTPs:', count);
    return count;
  }

  static async upsert(otpData) {
    console.log('🔧 Mock OtpCode.upsert called with:', otpData);
    
    // Cari OTP berdasarkan user_id dan code
    let existingOtp = null;
    if (otpData.id) {
      existingOtp = await this.findById(otpData.id);
    } else if (otpData.user_id && otpData.code) {
      existingOtp = mockOtpCodes.find(o => 
        o.user_id === otpData.user_id && 
        o.code === otpData.code
      );
    }

    if (existingOtp) {
      // Update existing OTP
      Object.assign(existingOtp, otpData);
      existingOtp.updated_at = new Date().toISOString();
      console.log('✅ Mock OTP updated via upsert:', existingOtp.id);
      return existingOtp;
    } else {
      // Create new OTP
      return await this.create(otpData);
    }
  }

  // Method untuk testing - reset mock data
  static resetMockData() {
    console.log('🔄 Resetting mock OTP data...');
    mockOtpCodes = [];
  }

  // Method untuk testing - get mock data
  static getMockData() {
    return [...mockOtpCodes];
  }

  // Method untuk testing - add mock OTP
  static addMockOtp(otpData) {
    const newOtp = {
      id: otpData.id || `otp-${Date.now()}`,
      ...otpData,
      created_at: otpData.created_at || new Date().toISOString(),
      updated_at: otpData.updated_at || new Date().toISOString()
    };
    mockOtpCodes.push(newOtp);
    return newOtp;
  }

  // Method untuk testing - cleanup expired OTPs
  static cleanupExpired() {
    console.log('🧹 Cleaning up expired OTPs...');
    const now = new Date();
    const beforeCount = mockOtpCodes.length;
    mockOtpCodes = mockOtpCodes.filter(o => new Date(o.expires_at) > now);
    const afterCount = mockOtpCodes.length;
    console.log(`🗑️ Removed ${beforeCount - afterCount} expired OTPs`);
    return beforeCount - afterCount;
  }
}

console.log('🔧 Mock OtpCode model initialized');

module.exports = OtpCode;