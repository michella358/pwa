import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} />;
  }

  return children;
}

export default ProtectedRoute;