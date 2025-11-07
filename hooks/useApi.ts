'use client';

import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import toast from 'react-hot-toast';

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

/**
 * Reusable API fetch hook with standardized error handling and loading states
 */
export function useApi<T = unknown>(options: UseApiOptions<T> = {}): UseApiReturn<T> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage = 'An error occurred',
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError, handleApiError } = useErrorHandler();

  const execute = useCallback(
    async (url: string, fetchOptions?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions?.headers,
          },
        });

        if (!response.ok) {
          await handleApiError(response, errorMessage);
          return null;
        }

        const responseData: T = await response.json();
        setData(responseData);

        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(responseData);
        }

        return responseData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(errorMessage);
        setError(error);

        if (showErrorToast) {
          handleError(error, errorMessage);
        }

        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast, handleError, handleApiError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

