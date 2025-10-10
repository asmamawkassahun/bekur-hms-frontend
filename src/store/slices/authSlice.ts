import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { TokenManager } from '@/lib/auth/token-manager';
import Cookies from 'js-cookie';

// Temporary types to avoid circular dependency
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles: { id: string; name: string }[];
  permissions: string[];
  properties?: unknown[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginWithOTPCredentials {
  email: string;
  password: string;
}

interface VerifyOTPData {
  email: string;
  otp: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Use real authService and TokenManager

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  permissions: [],
  roles: [],
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    console.log('🔐 Redux login thunk called with credentials:', credentials);

    try {
      console.log('🔐 Calling authService.login...');
      const response = await authService.login(credentials);
      console.log('🔐 Auth service response:', response);

      const { accessToken, refreshToken, user } = response.data.data!;
      console.log('🔐 Extracted tokens and user:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
        user: user ? 'present' : 'missing',
      });

      // Store tokens securely
      console.log('🔐 Storing tokens...');
      TokenManager.setTokens(accessToken, refreshToken);
      console.log('🔐 Tokens stored successfully');

      return { accessToken, refreshToken, user };
    } catch (error: unknown) {
      console.error('🔐 Redux login thunk error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      console.log('🔐 Rejecting with error message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async (credentials: LoginWithOTPCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithOTP(credentials);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'OTP login failed';
      return rejectWithValue(errorMessage);
    }
  },
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: VerifyOTPData, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(data);
      const { accessToken, refreshToken, user } = response.data.data!;

      // Store tokens securely
      TokenManager.setTokens(accessToken, refreshToken);


      return { accessToken, refreshToken, user };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'OTP verification failed';
      return rejectWithValue(errorMessage);
    }
  },
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.resendOTP(email);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to resend OTP',
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: ForgotPasswordData, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to send reset email',
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to reset password',
      );
    }
  },
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshTokens(refreshToken);

      // Validate response status and structure
      if (
        response.status !== 200 ||
        !response.data.success ||
        !response.data.data?.accessToken ||
        !response.data.data?.refreshToken
      ) {
        console.error('Invalid refresh token response:', {
          status: response.status,
          success: response.data.success,
          hasAccessToken: !!response.data.data?.accessToken,
          hasRefreshToken: !!response.data.data?.refreshToken,
        });
        throw new Error('Invalid refresh token response');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        response.data.data;

      // Update stored tokens
      TokenManager.setTokens(accessToken, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: unknown) {
      console.error('Refresh tokens thunk failed:', error);

      // Clear tokens on refresh failure
      TokenManager.clearTokens();

      return rejectWithValue(
        error instanceof Error ? error.message : 'Token refresh failed',
      );
    }
  },
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data.data!;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to get profile',
      );
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch (error: unknown) {
    // Continue with logout even if API call fails
    console.error('Logout API call failed:', error);
  } finally {

    // Always clear local tokens
    TokenManager.clearTokens();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.permissions = action.payload.permissions || [];
      state.roles =
        action.payload.roles?.map((role: { name: string }) => role.name) || [];
      state.isAuthenticated = true;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      console.log('🔐 Redux reducer: clearAuth called');
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.permissions = [];
      state.roles = [];
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;


      // Clear tokens from storage
      TokenManager.clearTokens();

    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log(
          '🔐 Redux reducer: login.fulfilled called with payload:',
          action.payload,
        );
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.permissions = action.payload.user.permissions || [];
        state.roles =
          action.payload.user.roles?.map(
            (role: { name: string }) => role.name,
          ) || [];
        state.isAuthenticated = true;
        state.error = null;
        console.log('🔐 Redux reducer: state updated:', {
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          hasAccessToken: !!state.accessToken,
          permissions: state.permissions,
          roles: state.roles,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Login with OTP
      .addCase(loginWithOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(loginWithOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.permissions = action.payload.user.permissions || [];
        state.roles =
          action.payload.user.roles?.map(
            (role: { name: string }) => role.name,
          ) || [];
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Refresh tokens
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.permissions = [];
        state.roles = [];
        state.isAuthenticated = false;
      })

      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.permissions = action.payload.permissions || [];
        state.roles =
          action.payload.roles?.map((role: { name: string }) => role.name) ||
          [];
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        console.log('🔐 Redux reducer: logout.fulfilled called');
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.permissions = [];
        state.roles = [];
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;

        // Clear tokens from storage
        TokenManager.clearTokens();
      });
  },
});

// Initialize auth state from storage (cookies, sessionStorage, localStorage)
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch }) => {
    console.log('🔐 Initializing auth state from storage...');

    if (typeof window === 'undefined') {
      return null;
    }

    // Check tokens in order: sessionStorage > cookies > localStorage
    let accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    // Fallback to cookie if sessionStorage is empty
    if (!accessToken) {
      accessToken = Cookies.get('auth-token') || null;
    }

    console.log('🔐 Token check:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (accessToken && refreshToken) {
      console.log('🔐 Found tokens in storage');

      // Set tokens in Redux state
      dispatch(setTokens({ accessToken, refreshToken }));

      // Try to get user profile
      try {
        const response = await authService.getProfile();
        const user = response.data.data!;
        console.log('🔐 User profile loaded:', user);
        dispatch(setUser(user));
        return { accessToken, refreshToken, user };
      } catch (error) {
        console.error('🔐 Failed to load user profile:', error);
        // Clear invalid tokens and set error state
        TokenManager.clearTokens();
        dispatch(setError('Session expired. Please login again.'));
        return null;
      }
    }

    console.log('🔐 No valid tokens found in storage');
    return null;
  },
);

export const {
  clearError,
  setError,
  setLoading,
  updateTokens,
  setUser,
  clearAuth,
  setTokens,
} = authSlice.actions;
export default authSlice.reducer;
