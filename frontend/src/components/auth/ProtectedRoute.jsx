/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes from unauthenticated access.
 * If user is not logged in, they are redirected to the login page.
 * 
 * BEGINNER TIP:
 * - This is a Higher Order Component (HOC) pattern
 * - It wraps around child components/routes
 * - It checks authentication before rendering children
 * - React Router's Navigate component handles redirects
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../common';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  // If not authenticated, redirect to login
  // We save the current location so we can redirect back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
