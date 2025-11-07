'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';

export interface ErrorResponse {
  error?: {
    message?: string;
    code?: string;
  };
  message?: string;
}

/**
 * Standardized error handling hook
 * Provides consistent error handling with toast notifications
 */
export function useErrorHandler() {
  const handleError = useCallback((error: unknown, defaultMessage = 'An error occurred'): void => {
    let message = defaultMessage;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    }

    // Extract error message from API response format
    if (error && typeof error === 'object' && 'error' in error) {
      const errorObj = (error as { error?: ErrorResponse['error'] }).error;
      if (errorObj?.message) {
        message = errorObj.message;
      }
    }

    console.error('Error:', error);
    toast.error(message);
  }, []);

  const handleApiError = useCallback(async (response: Response, defaultMessage = 'Request failed'): Promise<never> => {
    try {
      const data: ErrorResponse = await response.json();
      const message = data.error?.message || data.message || defaultMessage;
      throw new Error(message);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(defaultMessage);
    }
  }, []);

  return {
    handleError,
    handleApiError,
  };
}

