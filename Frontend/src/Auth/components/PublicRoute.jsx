import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (token && user.role) {
    // Check if user is verified
    if (!user.isVerified) {
      return <Navigate to="/verify-otp" replace />;
    }
    // Redirect verified users to their dashboard
    const dashboardRoute = user.role === 'alumni' ? '/alumni-dashboard' : '/student-dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }
  
  return children;
};

export default PublicRoute;