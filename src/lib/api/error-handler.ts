import { AxiosError } from 'axios';
import { ApiError } from '@/types';

export function handleApiError(error: AxiosError): ApiError {
  const responseData = error.response?.data as any;

  // Try to extract a useful message from various common response shapes
  const extractedMessage =
    responseData?.error?.message ||
    responseData?.message ||
    (Array.isArray(responseData?.errors) && responseData.errors[0]?.message) ||
    (typeof responseData === 'string' ? responseData : undefined);

  switch (error.response?.status) {
    case 400:
      return {
        message: extractedMessage || 'Bad request',
        type: 'validation',
        details: responseData?.error?.details,
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
    case 409:
      return {
        message: extractedMessage || 'Resource conflict',
        type: 'validation',
        details: responseData?.error?.details,
      };
    case 422:
      return {
        message: extractedMessage || 'Validation failed',
        type: 'validation',
        details: responseData?.error?.details,
      };
    case 429:
      return {
        message: extractedMessage || 'Too many requests. Please slow down.',
        type: 'unknown',
      };
    case 500:
      return {
        message: 'Internal server error. Please try again later.',
        type: 'server',
      };
    default:
      return {
        message: extractedMessage || 'An unexpected error occurred',
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
