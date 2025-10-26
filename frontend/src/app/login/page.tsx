"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'admin' | 'client'>('client');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi berdasarkan tipe login
    if (loginType === 'admin') {
      if (!email || !password) {
        setError('Email dan password harus diisi');
        setLoading(false);
        return;
      }
    } else {
      if (!whatsappNumber || !password) {
        setError('Nomor WhatsApp dan password harus diisi');
        setLoading(false);
        return;
      }
    }

    try {
      const loginData = loginType === 'admin' 
        ? { email, password, loginType: 'admin' }
        : { whatsapp_number: whatsappNumber, password, loginType: 'client' };

      const res = await axios.post('/api/auth/login', loginData);

      const { token, user } = res.data;
      localStorage.setItem('token', token);

      // Arahkan sesuai role
      if (user.role === 'admin_master') {
        router.push('/admin/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 403 && data?.requiresVerification && data?.userId) {
        router.push(`/verify-otp?userId=${data.userId}`);
      } else {
        setError(data?.message || 'Login gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '1rem' }}>
      <div className="card auth-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        {/* Login Type Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <span>Tipe Login</span>
            <select 
              value={loginType} 
              onChange={(e) => setLoginType(e.target.value as 'admin' | 'client')}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="client">Client (WhatsApp)</option>
              <option value="admin">Admin (Email)</option>
            </select>
          </label>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          {loginType === 'admin' ? (
            <label>
              <span>Email</span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@example.com" 
              />
            </label>
          ) : (
            <label>
              <span>Nomor WhatsApp</span>
              <input 
                type="text" 
                value={whatsappNumber} 
                onChange={(e) => setWhatsappNumber(e.target.value)} 
                placeholder="62xxxxxxxxxx" 
              />
            </label>
          )}
          
          <label>
            <span>Password</span>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </label>
          
          <button type="submit" disabled={loading} className="btn">
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
        {loginType === 'client' && (
          <p>Belum punya akun? <a href="/register">Register</a></p>
        )}
        
        {loginType === 'admin' && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.875rem' }}>
            <strong>Admin Default:</strong><br />
            Email: admin@pwa-notification.com<br />
            Password: admin123
          </div>
        )}
      </div>
    </div>
  );
}