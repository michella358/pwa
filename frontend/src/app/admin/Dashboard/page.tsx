"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalNotifications: 0,
    totalSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && user.role !== 'admin_master') {
      router.push('/client/dashboard');
      return;
    }

    if (user && user.role === 'admin_master') {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard statistics
      const response = await axios.get('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Admin</h1>
      <p>Selamat datang, {user?.username || user?.whatsapp_number}</p>
      
      <div className="stats-container">
        <div className="stats-card">
          <h3>Total Pengguna</h3>
          <p className="stats-number">{stats.totalUsers}</p>
        </div>
        
        <div className="stats-card">
          <h3>Total Klien</h3>
          <p className="stats-number">{stats.totalClients}</p>
        </div>
        
        <div className="stats-card">
          <h3>Total Notifikasi</h3>
          <p className="stats-number">{stats.totalNotifications}</p>
        </div>
        
        <div className="stats-card">
          <h3>Total Subscription</h3>
          <p className="stats-number">{stats.totalSubscriptions}</p>
        </div>
      </div>
    </div>
  );
}