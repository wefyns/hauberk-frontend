import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/useAuth';
import { Pages } from '../constants/routes';


function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default PublicRoute;