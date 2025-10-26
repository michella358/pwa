import React, { useEffect, useState } from 'react';
import { getVapidPublicKey, subscribeToPushNotifications } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

function PushNotificationManager({ children }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState('idle');
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Hanya jalankan jika user sudah login dan browser mendukung notifikasi
    if (user && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      registerPushNotification();
    }
  }, [user]);

  const registerPushNotification = async () => {
    try {
      setSubscriptionStatus('loading');
      setError(null);

      // Minta izin notifikasi
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Izin notifikasi ditolak');
        setSubscriptionStatus('denied');
        return;
      }

      // Dapatkan service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Dapatkan VAPID public key dari server
      const vapidResponse = await getVapidPublicKey();
      if (!vapidResponse.success) {
        throw new Error(vapidResponse.error);
      }

      // Konversi VAPID public key ke format yang dibutuhkan
      const vapidPublicKey = vapidResponse.data;
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Cek apakah sudah ada langganan yang aktif
      let subscription = await registration.pushManager.getSubscription();

      // Jika belum ada langganan, buat langganan baru
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // Kirim langganan ke server
      const subscribeResponse = await subscribeToPushNotifications(subscription, user?._id);
      if (!subscribeResponse.success) {
        throw new Error(subscribeResponse.error);
      }

      setSubscriptionStatus('subscribed');
    } catch (err) {
      console.error('Error registering push notification:', err);
      setError(err.message || 'Gagal mendaftarkan notifikasi push');
      setSubscriptionStatus('error');
    }
  };

  // Fungsi untuk mengkonversi base64 string ke Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <>
      {children}
      {subscriptionStatus === 'error' && (
        <div className="notification-error">
          <p>Error: {error}</p>
          <button onClick={registerPushNotification}>Coba Lagi</button>
        </div>
      )}
    </>
  );
}

export default PushNotificationManager;