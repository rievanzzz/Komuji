import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedOrganizerRouteProps {
  children: React.ReactNode;
}

const ProtectedOrganizerRoute: React.FC<ProtectedOrganizerRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('=== ProtectedOrganizerRoute Debug ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('isLoading:', isLoading);
  console.log('user:', user);
  console.log('user role:', user?.role);
  console.log('localStorage token:', localStorage.getItem('token') ? 'exists' : 'missing');
  console.log('localStorage user:', localStorage.getItem('user'));

  // Show loading while checking auth
  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to signin');
    return <Navigate to="/signin?redirect=organizer" replace />;
  }

  // Check if user has organizer/admin role
  if (user?.role !== 'panitia' && user?.role !== 'admin') {
    console.log('User does not have organizer role, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('User authorized, rendering children');
  console.log('=== End ProtectedOrganizerRoute Debug ===');
  return <>{children}</>;
};

export default ProtectedOrganizerRoute;
