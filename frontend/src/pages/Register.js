import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    whatsapp_number: '',
    password: '',
    confirm_password: '',
    role: 'client' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.whatsapp_number || !formData.password || !formData.confirm_password) {
      setError('Semua field harus diisi');
      return;
    }
    
    if (formData.password !== formData.confirm_password) {
      setError('Password tidak cocok');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await register({
        whatsapp_number: formData.whatsapp_number,
        password: formData.password,
        role: formData.role
      });
      
      if (result.success) {
        // Redirect ke halaman verifikasi OTP
        navigate('/verify-otp', { 
          state: { whatsappNumber: formData.whatsapp_number } 
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat registrasi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Register</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="whatsapp_number">Nomor WhatsApp</label>
            <input
              type="text"
              id="whatsapp_number"
              name="whatsapp_number"
              className="form-control"
              value={formData.whatsapp_number}
              onChange={handleChange}
              placeholder="Contoh: 628123456789"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm_password">Konfirmasi Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              className="form-control"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Sudah punya akun? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;