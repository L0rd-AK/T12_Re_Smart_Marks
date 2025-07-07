import { baseApi } from './baseApi';
import type { LoginFormData, RegisterFormData } from '../../schemas/auth';
import { setCredentials, clearCredentials } from '../features/authSlice';
import { triggerGlobalLogout } from '../../hooks/useAuthPersistence';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface MessageResponse {
  message: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register user
    register: builder.mutation<AuthResponse, RegisterFormData>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          // Let the component handle the error display
          console.error('Registration failed:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // Login user
    login: builder.mutation<AuthResponse, LoginFormData>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          // Let the component handle the error display
          console.error('Login failed:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // Google login
    googleLogin: builder.mutation<AuthResponse, { credential: string }>({
      query: (data) => ({
        url: '/auth/google',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          // Let the component handle the error display
          console.error('Google login failed:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // Logout user
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Continue with logout even if API call fails
        } finally {
          // Trigger global logout across all tabs
          triggerGlobalLogout();
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // Forgot password
    forgotPassword: builder.mutation<MessageResponse, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<MessageResponse, { token: string; password: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify email
    verifyEmail: builder.mutation<MessageResponse, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Resend verification email
    resendVerificationEmail: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: '/auth/resend-verification',
        method: 'POST',
      }),
    }),

    // Get current user profile
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // Refresh token
    refreshToken: builder.mutation<{ accessToken: string }, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
} = authApi;
