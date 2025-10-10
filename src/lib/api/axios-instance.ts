import axios from 'axios';
import { TokenManager } from '@/lib/auth/token-manager';

// Extend Window interface to include Redux store
declare global {
  interface Window {
    __REDUX_STORE__?: any;
  }
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Process failed requests queue
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = TokenManager.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 Attempting to refresh access token...');

        // Attempt to refresh tokens
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        console.log('✅ Token refresh successful');

        // Update tokens in storage
        TokenManager.setTokens(accessToken, newRefreshToken);

        // Update auth cookie
        if (typeof document !== 'undefined') {
          document.cookie = `auth-token=${accessToken}; path=/; max-age=3600; secure; samesite=strict`;
        }

        // Update Redux store if available
        if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
          try {
            const { updateTokens } = await import('@/store/slices/authSlice');
            window.__REDUX_STORE__?.dispatch(
              updateTokens({
                accessToken,
                refreshToken: newRefreshToken,
              }),
            );
          } catch (storeError) {
            console.warn(
              'Failed to update Redux store with new tokens:',
              storeError,
            );
          }
        }

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);

        // Process queued requests with error
        processQueue(refreshError, null);

        // Clear tokens and redirect to login
        TokenManager.clearTokens();

        // Clear auth cookie
        if (typeof document !== 'undefined') {
          document.cookie =
            'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        // Clear Redux store if available
        if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
          try {
            const { clearAuth } = await import('@/store/slices/authSlice');
            window.__REDUX_STORE__?.dispatch(clearAuth());
          } catch (storeError) {
            console.warn('Failed to clear Redux store:', storeError);
          }
        }

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
