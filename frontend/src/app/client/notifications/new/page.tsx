"use client";
import React, { useState } from 'react';
import { createNotification } from '@/services/notificationService';
import { useRouter } from 'next/navigation';

export default function NewNotificationPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title || !message) {
      setError('Judul dan pesan wajib diisi');
      setLoading(false);
      return;
    }

    const payload: any = {
      title,
      message,
    };
    if (iconUrl) payload.icon_url = iconUrl;
    if (targetUrl) payload.target_url = targetUrl;
    if (scheduledAt) payload.scheduled_at = scheduledAt; // ISO datetime string

    const res = await createNotification(payload);
    setLoading(false);
    if (res.success) {
      alert(res.data?.message || 'Notifikasi berhasil dibuat');
      router.push('/client/notifications');
    } else {
      setError(res.error || 'Gagal membuat notifikasi');
    }
  };

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1 className="text-xl font-bold">Buat Notifikasi Baru</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: 640 }}>
        <label>
          <span>Judul</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Judul notifikasi" />
        </label>
        <label>
          <span>Pesan</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input" placeholder="Isi pesan" rows={4} />
        </label>
        <label>
          <span>Icon URL (opsional)</span>
          <input type="url" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} className="input" placeholder="https://..." />
        </label>
        <label>
          <span>Target URL (opsional)</span>
          <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} className="input" placeholder="https://..." />
        </label>
        <label>
          <span>Jadwalkan (opsional)</span>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="input" />
        </label>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={loading} className="btn">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={() => router.push('/client/notifications')} className="btn">Batal</button>
        </div>
      </form>
    </div>
  );
}