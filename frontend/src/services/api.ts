import { toast } from '@/hooks/use-toast';
import axios from "axios";


export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// API Base URL - Update this to match your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  profileCompleted: boolean;
}

interface AuthData {
  user: User;
  token: string;
}

// Generic API request function with timeout
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request:', url, options);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    console.log('API Response:', data);

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timeout - server may be unavailable',
        error: 'Timeout',
      };
    }
    
    return {
      success: false,
      message: 'Network error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Auth API functions
export const authAPI = {
  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthData>> {
    const response = await apiRequest<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
    } else {
      toast({
        title: 'Login Failed',
        description: response.message || 'Invalid credentials',
        variant: 'destructive',
      });
    }

    return response;
  },

  // Register user
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthData>> {
    const response = await apiRequest<AuthData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
    } else {
      toast({
        title: 'Registration Failed',
        description: response.message || 'Failed to create account',
        variant: 'destructive',
      });
    }

    return response;
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<any>> {
    const response = await apiRequest<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast({
        title: 'Success',
        description: 'Password reset email sent! Please check your inbox.',
      });
    } else {
      toast({
        title: 'Error',
        description: response.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    }

    return response;
  },

  // Verify token
  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        success: false,
        message: 'No token found',
      };
    }

    const response = await apiRequest<{ user: User }>('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  },

  // Logout
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    });
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};

// Export types for use in components
export type { User, AuthData, LoginRequest, RegisterRequest, ForgotPasswordRequest, ApiResponse };

// Courses API functions
export const coursesAPI = {
  // Get all courses
  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    return await apiRequest<Course[]>('/courses', {
      method: 'GET',
    });
  },

  // Get course by slug
  async getCourseBySlug(slug: string): Promise<ApiResponse<Course>> {
    return await apiRequest<Course>(`/courses/${slug}`, {
      method: 'GET',
    });
  },

  // Create new course
  async createCourse(courseData: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return await apiRequest<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },
};

// Dashboard API functions
export const dashboardAPI = {
  // Get user dashboard data
  async getDashboardData(userId: string): Promise<ApiResponse<DashboardData>> {
    return await apiRequest<DashboardData>(`/dashboard/${userId}`, {
      method: 'GET',
    });
  },

  // Get user enrolled courses
  async getEnrolledCourses(userId: string): Promise<ApiResponse<Course[]>> {
    return await apiRequest<Course[]>(`/users/${userId}/enrolled-courses`, {
      method: 'GET',
    });
  },

  // Get user stats
  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    return await apiRequest<UserStats>(`/users/${userId}/stats`, {
      method: 'GET',
    });
  },
};

// Course interface for backend
interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  instructor?: string;
  duration?: string;
  lessonsCount?: number;
  category?: string;
  rating?: number;
  students?: number;
  progress?: number;
  isEnrolled?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateCourseRequest {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
}

interface DashboardData {
  user: User;
  enrolledCourses: Course[];
  activeCourses: Course[];
  stats: UserStats;
}

interface UserStats {
  enrolledCourses: number;
  activeCourses: number;
  certificatesEarned: number;
  hoursLearned: number;
}