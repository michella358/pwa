import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function VerifyOtp() {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mendapatkan nomor WhatsApp dari state navigasi
  const whatsappNumber = location.state?.whatsappNumber;
  
  useEffect(() => {
    if (!whatsappNumber) {
      navigate('/login');
    }
    
    // Timer untuk resend OTP
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, canResend, whatsappNumber, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpCode) {
      setError('Kode OTP harus diisi');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await verifyOtp(whatsappNumber, otpCode);
      
      if (result.success) {
        // Redirect akan ditangani oleh AuthContext
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat verifikasi OTP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      setLoading(true);
      setError('');
      
      const result = await resendOtp(whatsappNumber);
      
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim ulang OTP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Verifikasi OTP</h2>
        <p>Kode OTP telah dikirim ke WhatsApp {whatsappNumber}</p>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otpCode">Kode OTP</label>
            <input
              type="text"
              id="otpCode"
              className="form-control"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Masukkan kode OTP"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Verifikasi'}
          </button>
        </form>
        
        <div className="resend-otp">
          {canResend ? (
            <button 
              onClick={handleResendOtp} 
              className="btn-link"
              disabled={loading}
            >
              Kirim Ulang OTP
            </button>
          ) : (
            <p>Kirim ulang OTP dalam {countdown} detik</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;