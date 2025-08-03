import axios from 'axios';
import Cookies from 'js-cookie';

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

export interface QuestionTemplateData {
  name: string;
  type: 'quiz' | 'midterm' | 'final';
  year: string;
  courseName: string;
  courseCode: string;
  description: string;
  duration: number;
  instructions: string;
  isStandard: boolean;
  questions: Array<{
    id: string;
    questionNo: string;
    marks: number;
    courseOutcomeStatements?: string;
  }>;
}

export interface TemplateResponse {
  id: string;
  name: string;
  type: 'quiz' | 'midterm' | 'final';
  year: string;
  courseName: string;
  courseCode: string;
  description: string;
  questions: Array<{
    id: string;
    questionNo: string;
    marks: number;
    courseOutcomeStatements?: string;
  }>;
  totalMarks: number;
  duration: number;
  instructions: string;
  isStandard: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

export const templatesService = {
  // Create a new question paper template
  createTemplate: async (templateData: QuestionTemplateData): Promise<TemplateResponse> => {
    const response = await api.post('/templates', templateData);
    return response.data;
  },

  // Get all templates
  getTemplates: async (): Promise<TemplateResponse[]> => {
    const response = await api.get('/templates');
    return response.data;
  },

  // Get template by ID
  getTemplateById: async (id: string): Promise<TemplateResponse> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Update template
  updateTemplate: async (id: string, templateData: Partial<QuestionTemplateData>): Promise<TemplateResponse> => {
    const response = await api.put(`/templates/${id}`, templateData);
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`);
  },

  // Copy template
  copyTemplate: async (id: string): Promise<TemplateResponse> => {
    const response = await api.post(`/templates/${id}/copy`);
    return response.data;
  }
};
