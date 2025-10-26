"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!whatsappNumber || !password) {
      setError('Semua field harus diisi');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        whatsapp_number: whatsappNumber,
        password,
        role: 'client'
      });

      const { userId } = res.data;
      router.push(`/verify-otp?userId=${userId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '1rem' }}>
      <div className="card auth-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <label>
            <span>Nomor WhatsApp</span>
            <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="62xxxxxxxxxx" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" disabled={loading} className="btn">{loading ? 'Loading...' : 'Daftar'}</button>
        </form>
        <p>Sudah punya akun? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}