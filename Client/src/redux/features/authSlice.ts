import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  role: 'user' | 'admin' | 'teacher' | 'module-leader';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// Helper function to safely parse user from cookie
const getUserFromCookie = (): User | null => {
  try {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      const parsedUser = JSON.parse(userCookie);
      // Validate that the parsed object has the required User properties
      if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
        return parsedUser as User;
      }
    }
  } catch (error) {
    console.error('Error parsing user from cookie:', error);
    // Clear invalid cookie
    Cookies.remove('user');
  }
  return null;
};

// Helper function to check if token exists and is valid
const isTokenValid = (): boolean => {
  const token = Cookies.get('accessToken');
  return !!token;
};

// Initialize state from cookies with validation (fallback for when redux-persist is not available)
const initializeAuthState = (): AuthState => {
  const user = getUserFromCookie();
  const hasValidToken = isTokenValid();

  // If we have a user but no valid token, clear the user
  if (user && !hasValidToken) {
    Cookies.remove('user');
    return {
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    };
  }

  // If we have a valid token but no user, try to keep the token
  // (the user data might be fetched from an API call)
  return {
    user,
    isAuthenticated: hasValidToken && !!user,
    isInitialized: true,
  };
};

// Initial state - will be overridden by redux-persist
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;

      // Store tokens in cookies (not persisted by redux-persist for security)
      Cookies.set('accessToken', accessToken, {
        expires: 1, // 1 day
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      Cookies.set('refreshToken', refreshToken, {
        expires: 7, // 7 days
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      // Keep user in cookie as backup (though redux-persist will handle primary storage)
      Cookies.set('user', JSON.stringify(user), {
        expires: 7, // 7 days
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
    },

    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;

      // Clear cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update cookie with new user data as backup
        Cookies.set('user', JSON.stringify(state.user), {
          expires: 7,
          secure: window.location.protocol === 'https:',
          sameSite: 'lax'
        });
      }
    },

    // Action to manually initialize auth state (useful for app startup)
    initializeAuth: (state) => {
      // If redux-persist hasn't loaded yet, fall back to cookies
      if (!state.isInitialized) {
        const cookieState = initializeAuthState();
        state.user = cookieState.user;
        state.isAuthenticated = cookieState.isAuthenticated;
      }
      state.isInitialized = true;

      // Ensure tokens and state are in sync
      const hasValidToken = isTokenValid();
      if (state.isAuthenticated && !hasValidToken) {
        // We think we're authenticated but have no token
        state.isAuthenticated = false;
        state.user = null;
      } else if (!state.isAuthenticated && hasValidToken && state.user) {
        // We have a token and user but think we're not authenticated
        state.isAuthenticated = true;
      }
    },

    // Action to update authentication status without user data
    setAuthenticationStatus: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
      }
      state.isInitialized = true;
    },

    // Action to restore state from persisted storage (called by redux-persist)
    rehydrateAuthState: (state) => {
      state.isInitialized = true;
      // Validate that persisted state is consistent with cookies
      const hasValidToken = isTokenValid();
      if (state.isAuthenticated && !hasValidToken) {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  updateUser,
  initializeAuth,
  setAuthenticationStatus,
  rehydrateAuthState
} = authSlice.actions;

export default authSlice.reducer;
