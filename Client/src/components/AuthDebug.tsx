import React from 'react';
import { useAppSelector } from '../redux/hooks';
import Cookies from 'js-cookie';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  const userCookie = Cookies.get('user');

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-md text-xs z-50">
      <h4 className="font-bold text-green-400 mb-2">Auth Debug Info</h4>
      <div className="space-y-1">
        <div>
          <span className="text-blue-300">Redux State:</span>
        </div>
        <div>• isAuthenticated: {isAuthenticated.toString()}</div>
        <div>• isInitialized: {isInitialized.toString()}</div>
        <div>• user: {user ? `${user.name} (${user.role})` : 'null'}</div>
        
        <div className="mt-2">
          <span className="text-blue-300">Cookies:</span>
        </div>
        <div>• accessToken: {accessToken ? 'present' : 'missing'}</div>
        <div>• refreshToken: {refreshToken ? 'present' : 'missing'}</div>
        <div>• userCookie: {userCookie ? 'present' : 'missing'}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
