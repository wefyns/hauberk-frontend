import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Custom hook for using the auth context
 * @returns {Object} The auth context
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};