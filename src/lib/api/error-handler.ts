import { AxiosError } from 'axios';
import { ApiError } from '@/types';

export function handleApiError(error: AxiosError): ApiError {
  const response = error.response?.data as
    | { error?: { message?: string; details?: Record<string, unknown> } }
    | undefined;

  switch (error.response?.status) {
    case 400:
      return {
        message: response?.error?.message || 'Bad request',
        type: 'validation',
        details: response?.error?.details,
      };
    case 401:
      return {
        message: 'Session expired. Please log in again.',
        type: 'auth',
      };
    case 403:
      return {
        message:
          "Access denied. You don't have permission to perform this action.",
        type: 'permission',
      };
    case 404:
      return {
        message: 'Resource not found',
        type: 'notFound',
      };
    case 422:
      return {
        message: response?.error?.message || 'Validation failed',
        type: 'validation',
        details: response?.error?.details,
      };
    case 500:
      return {
        message: 'Internal server error. Please try again later.',
        type: 'server',
      };
    default:
      return {
        message: response?.error?.message || 'An unexpected error occurred',
        type: 'unknown',
      };
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
