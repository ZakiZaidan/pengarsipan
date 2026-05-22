import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.peran)) {
    toast.error('Anda tidak memiliki akses ke halaman ini');
    return <Navigate to="/" replace />;
  }

  return children;
}
