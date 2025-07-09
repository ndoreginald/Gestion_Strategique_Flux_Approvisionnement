import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, roles } from '../context/AuthContext';

const UserProtectedRoute: React.FC = () => {
  const { userRole } = useAuth();

  if (userRole !== roles.USER) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
