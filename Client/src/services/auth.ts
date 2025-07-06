import axios from 'axios';
import Cookies from 'js-cookie';
import type { LoginFormData, RegisterFormData } from '../schemas/auth';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          
          Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

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

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: { [key: string]: string };
}

class AuthService {
  // Register user
  async register(data: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user in cookies
      Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
      Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
      Cookies.set('user', JSON.stringify(user), { expires: 7 });

      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Login user
  async login(data: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user in cookies
      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });

      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Google login
  async googleLogin(credential: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/google', { credential });
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user in cookies
      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });

      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue with logout even if API call fails
    } finally {
      // Clear all auth data
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const userCookie = Cookies.get('user');
    return userCookie ? JSON.parse(userCookie) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!Cookies.get('accessToken');
  }

  // Get access token
  getAccessToken(): string | null {
    return Cookies.get('accessToken') || null;
  }

  // Handle API errors
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error) && error.response) {
      return {
        message: error.response.data.message || 'An error occurred',
        statusCode: error.response.status,
        errors: error.response.data.errors,
      };
    } else if (axios.isAxiosError(error) && error.request) {
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    } else {
      return {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        statusCode: 0,
      };
    }
  }
}

export const authService = new AuthService();
export default api;
