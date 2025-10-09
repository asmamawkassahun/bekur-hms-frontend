// Re-export all types for easier imports
export * from './api.types';
export * from './auth.types';
export * from './property.types';
export * from './room.types';
export * from './guest.types';
export * from './reservation.types';

// Common Types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Status Types
export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_ORDER';

export type BedStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_ORDER';

// Form Types
export interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

// Table Types
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRow?: (
    record: T,
    index: number,
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
  };
}

// Export Types
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Theme Types
export interface ThemeConfig {
  brand: {
    name: string;
    logo: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading: string;
    };
  };
  spacing: {
    unit: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// User Role Types
export type UserRole =
  | 'SUPER_ADMIN'
  | 'PROPERTY_MANAGER'
  | 'FRONT_DESK'
  | 'HOUSEKEEPING'
  | 'FINANCE_STAFF';

// Menu Types
export interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission?: string;
  children?: MenuItem[];
}
