import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireVendor = false, redirectTo }) => {
  const { isAuthenticated, isAdmin, isVendor, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const fallback = requireAdmin ? '/admin/login' : '/login';
    return <Navigate to={redirectTo || fallback} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireVendor && !isVendor) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
