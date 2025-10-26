"use client";
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import NextNavbar from '@/components/NextNavbar';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ServiceWorkerRegistrar />
      <NextNavbar />
      {children}
    </AuthProvider>
  );
}