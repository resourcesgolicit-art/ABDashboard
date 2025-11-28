// API Configuration for Frontend
// Place this in src/lib/api-config.ts

export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const API_ENDPOINTS = {
  TEST: '/test',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  COURSES: '/api/courses',
  COUPONS: '/api/coupons',
  USERS: '/api/users',
  WEBINARS: '/api/webinars',
};

// Enhanced fetch function with retry logic
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'include',
    ...options,
  };

  for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`🔄 API Request (attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS}): ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ API Request successful: ${url}`);
      return response;
      
    } catch (error) {
      console.warn(`❌ API Request failed (attempt ${attempt}): ${error.message}`);
      
      if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
        console.error(`🚫 All ${API_CONFIG.RETRY_ATTEMPTS} attempts failed for: ${url}`);
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
    }
  }
}

// Test backend connection
export async function testBackendConnection(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const response = await apiRequest(API_ENDPOINTS.TEST);
    const data = await response.json();
    
    return {
      success: true,
      message: 'Backend connection successful',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// Get backend status with detailed info
export async function getBackendStatus() {
  try {
    const result = await testBackendConnection();
    
    if (result.success) {
      return {
        status: 'online',
        message: `Server is running on port ${result.data?.port || '3000'}`,
        timestamp: result.data?.timestamp,
        details: result.data,
      };
    } else {
      return {
        status: 'offline',
        message: result.message,
        timestamp: new Date().toISOString(),
        details: null,
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      details: null,
    };
  }
}