"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered with scope:', registration.scope);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      // Register on load to ensure Next hydration completes
      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
        return () => window.removeEventListener('load', register);
      }
    }
  }, []);

  return null;
}