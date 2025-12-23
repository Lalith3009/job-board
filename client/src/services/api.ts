import axios from 'axios';
import type { AuthResponse, SignupData, LoginData, User, Job } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put<{ message: string; user: User }>('/auth/profile', data);
    return response.data;
  }
};

// Jobs API
export interface JobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface JobFilters {
  search?: string;
  jobType?: string;
  location?: string;
  remoteOk?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateJobData {
  title: string;
  company?: string;
  description: string;
  requirements?: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'internship' | 'contract';
  salaryMin?: number;
  salaryMax?: number;
  remoteOk?: boolean;
}

export const jobsApi = {
  // Get all jobs (public)
  getJobs: async (filters?: JobFilters): Promise<JobsResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.jobType) params.append('jobType', filters.jobType);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.remoteOk) params.append('remoteOk', 'true');
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<JobsResponse>(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get single job
  getJob: async (id: number): Promise<{ job: Job }> => {
    const response = await api.get<{ job: Job }>(`/jobs/${id}`);
    return response.data;
  },

  // Get recruiter's jobs
  getMyJobs: async (): Promise<{ jobs: Job[] }> => {
    const response = await api.get<{ jobs: Job[] }>('/jobs/recruiter/my-jobs');
    return response.data;
  },

  // Create job (recruiter only)
  createJob: async (data: CreateJobData): Promise<{ job: Job }> => {
    const response = await api.post<{ message: string; job: Job }>('/jobs', data);
    return response.data;
  },

  // Update job (recruiter only)
  updateJob: async (id: number, data: Partial<CreateJobData & { status: string }>): Promise<{ job: Job }> => {
    const response = await api.put<{ message: string; job: Job }>(`/jobs/${id}`, data);
    return response.data;
  },

  // Delete job (recruiter only)
  deleteJob: async (id: number): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  }
};

export default api;
