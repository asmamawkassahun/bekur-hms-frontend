// User Types
export interface User {
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
  roles: Role[];
  permissions: string[];
  properties?: Property[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

// Import Property from property types to avoid duplication
import { Property } from './property.types';

// Auth State Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Auth Action Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginWithOTPCredentials {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Token Response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// User Role Types
export type UserRole =
  | 'SUPER_ADMIN'
  | 'PROPERTY_MANAGER'
  | 'FRONT_DESK'
  | 'HOUSEKEEPING'
  | 'FINANCE_STAFF';

// Menu Item Types
export interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission?: string;
  children?: MenuItem[];
}
