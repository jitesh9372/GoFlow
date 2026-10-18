import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole
}) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-transit-muted">
        <span className="inline-block animate-spin mr-2">🚆</span>
        <span>Verifying Mumbai transit authorization credentials...</span>
      </div>
    );
  }

  // Requirement 4: Stricter route guards.
  // The frontend guard must require a signed-in user with a valid role claim and a profile,
  // not just user != null. Redirect everyone else to /signin.
  const hasValidProfile = Boolean(user && user.uid && user.email);
  const hasValidRole = Boolean(role && (role === 'admin' || role === 'passenger') && user?.role === role);

  if (!user || !hasValidProfile || !hasValidRole) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If user is not authorized admin and tries to access admin route, restrict to passenger portal
    if (allowedRole === 'admin' && role !== 'admin') {
      return <Navigate to="/passenger" replace />;
    }
    // If admin tries to access passenger route, redirect to admin dashboard
    if (allowedRole === 'passenger' && role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};
