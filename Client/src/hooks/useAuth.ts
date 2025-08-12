import { useAppSelector } from '../redux/hooks';
import Cookies from 'js-cookie';

/**
 * Custom hook to access authentication state from Redux store
 */
export const useAuth = () => {
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  
  return {
    user,
    isAuthenticated,
    isInitialized,
    // Get token from cookies
    token: Cookies.get('accessToken'),
  };
}; 