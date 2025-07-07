import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { useGetCurrentUserQuery } from '../redux/api/authApi';
import { setCredentials } from '../redux/features/authSlice';
import Cookies from 'js-cookie';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Check if we have a token but no user data (edge case)
  const hasToken = !!Cookies.get('accessToken');
  const needsUserData = hasToken && !user;
  
  // Fetch current user only if we have a token but no user data
  const { 
    data: currentUser, 
    error,
    isLoading 
  } = useGetCurrentUserQuery(undefined, {
    skip: !needsUserData
  });

  // Update Redux state when we get fresh user data
  useEffect(() => {
    if (currentUser && hasToken) {
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');
      
      if (accessToken && refreshToken) {
        dispatch(setCredentials({
          user: currentUser,
          accessToken,
          refreshToken
        }));
      }
    }
  }, [currentUser, hasToken, dispatch]);

  // Handle API errors (invalid token, etc.)
  useEffect(() => {
    if (error && hasToken) {
      console.warn('Failed to fetch current user, token may be invalid');
      // Let the baseApi handle token refresh/clearing
    }
  }, [error, hasToken]);

  // Show loading only when we're fetching critical user data
  if (needsUserData && isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/70">Loading user data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
