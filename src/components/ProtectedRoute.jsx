import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/useAuth';
import { Pages } from '../constants/routes';

/**
 * A wrapper component for routes that require authentication
 * Redirects to login page if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext();

  // Show nothing while checking authentication status
  if (loading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to={Pages.Login} replace />;
  }

  // Render the protected content if authenticated
  return children;
}

export default ProtectedRoute;