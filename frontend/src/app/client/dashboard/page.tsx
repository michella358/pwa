"use client";
import React, { useEffect, useState } from 'react';
import PushNotificationManager from '@/components/PushNotificationManager';
import { getUserNotifications } from '@/services/notificationService';

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalNotifications: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      const res = await getUserNotifications();
      if (res.success) {
        const notifications = res.data?.notifications || [];
        setStats({ totalNotifications: notifications.length });
      } else {
        setError(res.error || 'Gagal memuat data notifikasi');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <PushNotificationManager>
      <div className="container" style={{ padding: '1rem' }}>
        <h1 className="text-xl font-bold">Client Dashboard</h1>
        {loading && <p>Memuat statistik...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && stats && (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <div className="card" style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
              <h2 className="font-semibold">Total Notifikasi</h2>
              <p className="text-2xl">{stats.totalNotifications}</p>
            </div>
            <div className="card" style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
              <h2 className="font-semibold">Status Langganan Push</h2>
              <p>Terdaftar otomatis saat halaman dimuat.</p>
            </div>
            <div className="card" style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
              <h2 className="font-semibold">Aksi Cepat</h2>
              <ul>
                <li><a href="/client/notifications" className="text-blue-600">Lihat Notifikasi</a></li>
                <li><a href="/client/notifications/new" className="text-blue-600">Buat Notifikasi</a></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </PushNotificationManager>
  );
}