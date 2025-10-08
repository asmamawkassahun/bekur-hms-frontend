import { apiClient } from '@/lib/api/axios-instance';
import {
  LoginCredentials,
  LoginWithOTPCredentials,
  VerifyOTPData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  ApiResponse,
  TokenResponse,
  User,
} from '@/types';

export const authService = {
  /**
   * Login with email and password
   */
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/signin', credentials),

  /**
   * Login with OTP (sends OTP to email)
   */
  loginWithOTP: (credentials: LoginWithOTPCredentials) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/signin-with-otp',
      credentials,
    ),

  /**
   * Verify OTP and complete login
   */
  verifyOTP: (data: VerifyOTPData) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/verify-otp', data),

  /**
   * Resend OTP
   */
  resendOTP: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-otp', {
      email,
    }),

  /**
   * Forgot password (sends reset email)
   */
  forgotPassword: (data: ForgotPasswordData) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      data,
    ),

  /**
   * Reset password with token
   */
  resetPassword: (data: ResetPasswordData) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      data,
    ),

  /**
   * Change password (authenticated user)
   */
  changePassword: (data: ChangePasswordData) =>
    apiClient.patch<ApiResponse<{ message: string }>>(
      '/auth/change-password',
      data,
    ),

  /**
   * Refresh access token
   */
  refreshTokens: (refreshToken: string) =>
    apiClient.post<ApiResponse<TokenResponse>>(
      '/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    ),

  /**
   * Logout
   */
  logout: () =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/logout'),

  /**
   * Get current user profile
   */
  getProfile: () => apiClient.get<ApiResponse<User>>('/auth/me'),
};
