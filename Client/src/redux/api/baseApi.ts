import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { clearCredentials } from '../features/authSlice';
import Cookies from 'js-cookie';

// Define base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = Cookies.get('accessToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with re-auth logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken } = refreshResult.data as { accessToken: string };
        // Store the new token with proper options
        Cookies.set('accessToken', accessToken, {
          expires: 1,
          secure: window.location.protocol === 'https:',
          sameSite: 'lax'
        });

        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, clear auth data
        api.dispatch(clearCredentials());

        // Only redirect if we're not already on auth pages
        const currentPath = window.location.pathname;
        const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
        if (!authPaths.includes(currentPath)) {
          window.location.href = '/login';
        }
      }
    } else {
      // No refresh token, clear auth data
      api.dispatch(clearCredentials());

      // Only redirect if we're not already on auth pages
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      if (!authPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
  }

  return result;
};

// Create the base API slice
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'Marks','QuestionFormat', 'QuestionFormats', 'Templates', 'DocumentSubmission', 'GoogleDriveFiles', 'Admin', 'Department', 'Course', 'Batch', 'Section', 'ModuleLeader'],
  endpoints: () => ({}),
});
