import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { initializeAuth, setAuthenticationStatus } from '../redux/features/authSlice';
import Cookies from 'js-cookie';

/**
 * Custom hook to manage auth state persistence and synchronization
 * This ensures user state remains consistent across page reloads
 */
export const useAuthPersistence = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Listen for storage events (when user logs out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_logout') {
        // User logged out in another tab
        dispatch(initializeAuth());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  // Periodically check token validity
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = Cookies.get('accessToken');
      const hasUser = !!user;
      
      // If we think we're authenticated but have no token, clear the state
      if (isAuthenticated && !token) {
        dispatch(setAuthenticationStatus(false));
      }
      
      // If we have a token but think we're not authenticated, update the state
      if (!isAuthenticated && token && hasUser) {
        dispatch(setAuthenticationStatus(true));
      }
    };

    // Check immediately
    if (isInitialized) {
      checkTokenValidity();
    }

    // Check every 30 seconds
    const interval = setInterval(checkTokenValidity, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user, isInitialized, dispatch]);

  // Listen for focus events to refresh auth state
  useEffect(() => {
    const handleFocus = () => {
      // When the window regains focus, check if auth state is still valid
      dispatch(initializeAuth());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    isInitialized
  };
};

/**
 * Utility function to manually trigger logout across all tabs
 */
export const triggerGlobalLogout = () => {
  // Set a flag in localStorage that other tabs can listen for
  localStorage.setItem('auth_logout', Date.now().toString());
  localStorage.removeItem('auth_logout');
};
