import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, roles } from '../context/AuthContext';

interface AdminProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode; // children is optional because Outlet might be used
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { userRole } = useAuth();

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminProtectedRoute;
