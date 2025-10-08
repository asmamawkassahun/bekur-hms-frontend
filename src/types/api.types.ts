// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  type:
    | 'validation'
    | 'auth'
    | 'permission'
    | 'notFound'
    | 'server'
    | 'unknown';
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

// Filter Types
export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface StatusFilter {
  status?: string;
  statuses?: string[];
}

export interface PropertyFilter {
  propertyId?: string;
  propertyIds?: string[];
}
