import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../store';

const AuthRedirect: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  if (isAuthenticated) {
    // If authenticated, redirect to the home page or dashboard
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default AuthRedirect;