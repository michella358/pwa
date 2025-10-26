import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [loginType, setLoginType] = useState('whatsapp'); // 'whatsapp', 'username', 'email'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      setError('Semua field harus diisi');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await login(identifier, password, loginType);
      
      if (result.success) {
        // Redirect akan ditangani oleh AuthContext
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInputLabel = () => {
    switch (loginType) {
      case 'whatsapp':
        return 'Nomor WhatsApp';
      case 'username':
        return 'Username';
      case 'email':
        return 'Email';
      default:
        return 'Identifier';
    }
  };

  const getInputPlaceholder = () => {
    switch (loginType) {
      case 'whatsapp':
        return 'Contoh: 628123456789';
      case 'username':
        return 'Masukkan username';
      case 'email':
        return 'Masukkan email';
      default:
        return '';
    }
  };

  const getInputType = () => {
    return loginType === 'email' ? 'email' : 'text';
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Login</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loginType">Tipe Login</label>
            <select
              id="loginType"
              className="form-control"
              value={loginType}
              onChange={(e) => {
                setLoginType(e.target.value);
                setIdentifier(''); // Reset identifier when changing type
              }}
            >
              <option value="whatsapp">WhatsApp (Client)</option>
              <option value="username">Username (Admin)</option>
              <option value="email">Email (Admin)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="identifier">{getInputLabel()}</label>
            <input
              type={getInputType()}
              id="identifier"
              className="form-control"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={getInputPlaceholder()}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Belum punya akun? <Link to="/register">Register</Link>
          </p>
          {loginType === 'username' && (
            <div className="admin-info">
              <small className="text-muted">
                <strong>Admin Default:</strong><br/>
                Username: admin<br/>
                Password: admin123
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;