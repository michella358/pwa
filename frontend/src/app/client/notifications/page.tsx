"use client";
import React, { useEffect, useState } from 'react';
import { getUserNotifications, deleteNotification } from '@/services/notificationService';

export default function ClientNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    const res = await getUserNotifications();
    if (res.success) {
      setNotifications(res.data?.notifications || []);
    } else {
      setError(res.error || 'Gagal memuat notifikasi');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = confirm('Hapus notifikasi ini?');
    if (!ok) return;
    const res = await deleteNotification(id);
    if (res.success) {
      await loadNotifications();
    } else {
      alert(res.error || 'Gagal menghapus notifikasi');
    }
  };

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1 className="text-xl font-bold">Notifikasi Saya</h1>
      {loading && <p>Memuat notifikasi...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && notifications.length === 0 && <p>Tidak ada notifikasi.</p>}
      <ul style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
        {notifications.map((n) => (
          <li key={n._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p className="font-semibold">{n.title}</p>
                <p>{n.message}</p>
                {n.target_url && (
                  <a href={n.target_url} className="text-blue-600" target="_blank" rel="noreferrer">Buka tautan</a>
                )}
              </div>
              <div>
                <button onClick={() => handleDelete(n._id)} className="text-red-600">Hapus</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}