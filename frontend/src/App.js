import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import AdminDashboard from './pages/admin/Dashboard';
import ClientDashboard from './pages/client/Dashboard';
import NotificationForm from './pages/client/NotificationForm';
import NotificationList from './pages/client/NotificationList';
import UserManagement from './pages/admin/UserManagement';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Client Routes */}
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/notifications" 
            element={
              <ProtectedRoute requiredRole="client">
                <NotificationList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/notifications/new" 
            element={
              <ProtectedRoute requiredRole="client">
                <NotificationForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to login or dashboard based on auth status */}
          <Route 
            path="/" 
            element={
              user 
                ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} /> 
                : <Navigate to="/login" />
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;