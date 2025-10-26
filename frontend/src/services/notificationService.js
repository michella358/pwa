import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Fungsi untuk mendapatkan token dari local storage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Fungsi untuk mendaftarkan langganan push
export const subscribeToPushNotifications = async (subscription, clientId) => {
  try {
    const subJson = subscription?.toJSON ? subscription.toJSON() : null;
    const payload = subJson
      ? {
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          client_id: clientId
        }
      : {
          // Fallback jika toJSON tidak tersedia
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys?.p256dh,
            auth: subscription.keys?.auth
          },
          client_id: clientId
        };

    const response = await axios.post(
      `${API_URL}/subscriptions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to subscribe' };
  }
};

// Fungsi untuk mendapatkan kunci publik VAPID
export const getVapidPublicKey = async () => {
  try {
    const response = await axios.get(`${API_URL}/subscriptions/vapid-public-key`);
    return { success: true, data: response.data.vapidPublicKey };
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to get VAPID key' };
  }
};

// Fungsi untuk mendapatkan semua notifikasi pengguna
export const getUserNotifications = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/notifications`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to get notifications' };
  }
};

// Fungsi untuk membuat notifikasi baru
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/notifications`,
      notificationData,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to create notification' };
  }
};

// Fungsi untuk menghapus notifikasi
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to delete notification' };
  }
};

// Fungsi untuk mendapatkan semua langganan (admin only)
export const getAllSubscriptions = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/subscriptions/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error getting all subscriptions:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to get subscriptions' };
  }
};