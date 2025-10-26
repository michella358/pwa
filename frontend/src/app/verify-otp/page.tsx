"use client";
import React, { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/login');
    }
    let timer: any;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [userId, countdown, canResend, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !otpCode) {
      setError('UserId dan Kode OTP wajib diisi');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        userId,
        otpCode
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      if (user.role === 'admin_master') {
        router.push('/admin/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Verifikasi OTP gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !userId) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { userId });
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '1rem' }}>
      <div className="card auth-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Verifikasi OTP</h2>
        <p>Masukkan kode OTP yang dikirim ke WhatsApp Anda.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <label>
            <span>Kode OTP</span>
            <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" />
          </label>
          <button type="submit" disabled={loading} className="btn">{loading ? 'Loading...' : 'Verifikasi'}</button>
        </form>
        <div className="resend-otp" style={{ marginTop: '0.75rem' }}>
          {canResend ? (
            <button onClick={handleResendOtp} className="btn-link" disabled={loading}>Kirim Ulang OTP</button>
          ) : (
            <p>Kirim ulang OTP dalam {countdown} detik</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}