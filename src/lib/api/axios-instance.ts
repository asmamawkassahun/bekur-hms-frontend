import axios from 'axios';
import { TokenManager } from '@/lib/auth/token-manager';
import Cookies from 'js-cookie';

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

    // For non-401 errors, reject with the error immediately
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Handle 401 errors (unauthorized) - only refresh, don't logout
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
          console.error('❌ No refresh token available in storage');
          throw new Error('No refresh token available');
        }

        const refreshEndpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`;

        console.log('🔄 Attempting to refresh access token...');
        console.log('📤 Refresh Token Request:', {
          endpoint: refreshEndpoint,
          method: 'POST',
          hasRefreshToken: !!refreshToken,
          refreshTokenLength: refreshToken.length,
          requestBody: { refreshToken: '***' }, // Hidden for security
        });

        // Attempt to refresh tokens - send refreshToken in body
        const response = await axios.post(
          refreshEndpoint,
          {
            refreshToken: refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('📥 Refresh Token Response:', {
          status: response.status,
          statusText: response.statusText,
          hasData: !!response.data,
          success: response.data?.success,
          hasAccessToken: !!response.data?.data?.accessToken,
          hasRefreshToken: !!response.data?.data?.refreshToken,
        });

        // Validate response structure
        if (
          response.status !== 200 ||
          !response.data.success ||
          !response.data.data?.accessToken ||
          !response.data.data?.refreshToken
        ) {
          console.error('❌ Invalid refresh token response structure');
          throw new Error('Invalid refresh token response');
        }

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        console.log('✅ Token refresh successful');

        // Update tokens in storage (this also updates the cookie)
        TokenManager.setTokens(accessToken, newRefreshToken);

        // Verify token consistency for middleware
        TokenManager.verifyTokenConsistency();

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
      } catch (refreshError: unknown) {
        console.error('❌ Token refresh failed');

        // Provide more specific error messages based on the failure type
        const error = refreshError as Error & { response?: { status: number; statusText: string; data: unknown }; code?: string; isAxiosError?: boolean };

        if (error.message === 'Refresh token expired') {
          console.error('🔄 Refresh token has expired - user needs to login again');
        } else if (error.message === 'No refresh token available') {
          console.error('🔑 No refresh token found - user needs to login again');
        } else if (error.response?.status === 401) {
          console.error('🚫 Server rejected refresh token - may be invalid or revoked');
        } else if (error.response?.status === 403) {
          console.error('🚫 Access forbidden - refresh token may be blacklisted');
        } else if (error.response?.status && error.response.status >= 500) {
          console.error('🔧 Server error during refresh - please try again later');
        } else if (error.code === 'NETWORK_ERROR') {
          console.error('🌐 Network error - please check connection');
        } else {
          console.error('❓ Unknown error during refresh');
        }

        console.error('📥 Refresh Token Error Details:', {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          responseData: error?.response?.data,
          code: error?.code,
          isAxiosError: error?.isAxiosError,
        });

        // Process queued requests with error
        processQueue(error, null);

        // If refresh request fails for ANY reason, clear everything and redirect to login
        console.log('🚪 Refresh request failed, logging out user and clearing all data');

        // Clear tokens from storage
        TokenManager.clearTokens();

        // Clear all localStorage items (optional: remove if you want to keep other data)
        if (typeof window !== 'undefined') {
          try {
            // Only clear auth-related items or clear everything based on your needs
            sessionStorage.clear();
            // localStorage.clear(); // Uncomment if you want to clear all localStorage
          } catch (error) {
            console.error('Failed to clear storage:', error);
          }
        }

        // Clear auth cookie
        if (typeof window !== 'undefined') {
          Cookies.remove('auth-token', { path: '/' });
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

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // For any other errors (network errors, etc.), reject immediately
    return Promise.reject(error);
  },
);
