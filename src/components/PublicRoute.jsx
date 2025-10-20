import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/useAuth';
import { Pages } from '../constants/routes';

/**
 * A wrapper component for public routes (like login)
 * Redirects to home if user is already authenticated
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext();

  // Show nothing while checking authentication status
  if (loading) {
    return null;
  }

  // Redirect to home if already authenticated
  if (isAuthenticated()) {
    return <Navigate to={Pages.Home} replace />;
  }

  // Render the public content if not authenticated
  return children;
}

export default PublicRoute;