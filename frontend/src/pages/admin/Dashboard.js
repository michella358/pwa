import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalNotifications: 0,
    totalSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch dashboard statistics
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Admin</h1>
      <p>Selamat datang, {user?.whatsapp_number}</p>
      
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
          <h3>Total Langganan</h3>
          <p className="stats-number">{stats.totalSubscriptions}</p>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Aktivitas Terbaru</h2>
        <p>Fitur ini akan segera hadir.</p>
      </div>
    </div>
  );
}

export default AdminDashboard;