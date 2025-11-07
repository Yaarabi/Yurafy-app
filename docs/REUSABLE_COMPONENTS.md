# Reusable Components and Hooks

This document describes the reusable components and hooks created to standardize error handling, loading states, and API calls across the codebase.

## Hooks

### `useErrorHandler`

Standardized error handling hook that provides consistent error handling with toast notifications.

**Location**: `hooks/useErrorHandler.ts`

**Usage**:
```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, handleApiError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        await handleApiError(response, 'Failed to fetch data');
        return;
      }
      const data = await response.json();
      // ...
    } catch (error) {
      handleError(error, 'An error occurred');
    }
  };
}
```

**API**:
- `handleError(error: unknown, defaultMessage?: string)`: Handles errors and shows toast notification
- `handleApiError(response: Response, defaultMessage?: string)`: Handles API error responses

---

### `useApi`

Reusable API fetch hook with standardized error handling and loading states.

**Location**: `hooks/useApi.ts`

**Usage**:
```typescript
import { useApi } from '@/hooks/useApi';

interface User {
  id: string;
  name: string;
}

function MyComponent() {
  const { data, loading, error, execute, reset } = useApi<User>({
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
    successMessage: 'Data loaded successfully',
    errorMessage: 'Failed to load data',
    showSuccessToast: true,
    showErrorToast: true,
  });

  useEffect(() => {
    execute('/api/user');
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

**API**:
- `data: T | null`: The fetched data
- `loading: boolean`: Loading state
- `error: Error | null`: Error state
- `execute(url: string, options?: RequestInit)`: Execute the API call
- `reset()`: Reset state

---

## Components

### `LoadingSpinner`

Reusable loading spinner component with consistent styling.

**Location**: `components/common/LoadingSpinner.tsx`

**Usage**:
```typescript
import LoadingSpinner from '@/components/common/LoadingSpinner';

function MyComponent() {
  return (
    <LoadingSpinner
      size="md" // 'sm' | 'md' | 'lg' | 'xl'
      text="Loading..."
      fullScreen={false}
    />
  );
}
```

**Props**:
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size of the spinner (default: 'md')
- `text?: string` - Optional text to display below spinner
- `className?: string` - Additional CSS classes
- `fullScreen?: boolean` - Whether to render in full-screen mode (default: false)

---

### `ErrorBoundary`

Error boundary component for catching React errors and providing a fallback UI.

**Location**: `components/common/ErrorBoundary.tsx`

**Usage**:
```typescript
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error tracking service
        console.error('Error caught:', error, errorInfo);
      }}
      fallback={<CustomErrorUI />} // Optional custom fallback
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

**Props**:
- `children: ReactNode` - Child components to wrap
- `fallback?: ReactNode` - Optional custom fallback UI
- `onError?: (error: Error, errorInfo: ErrorInfo) => void` - Error handler callback

---

## Migration Guide

### Before (Old Pattern)
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    // ...
  } catch (err) {
    console.error(err);
    alert('Error occurred');
  } finally {
    setLoading(false);
  }
};
```

### After (New Pattern)
```typescript
const { data, loading, error, execute } = useApi<DataType>({
  errorMessage: 'Failed to load data',
  showErrorToast: true,
});

useEffect(() => {
  execute('/api/data');
}, []);
```

---

## Benefits

1. **Consistency**: Standardized error handling and loading states across all components
2. **Maintainability**: Centralized logic makes it easier to update error handling behavior
3. **User Experience**: Consistent toast notifications and loading indicators
4. **Type Safety**: Proper TypeScript types for all hooks and components
5. **Accessibility**: Built-in ARIA labels and semantic HTML

---

## Next Steps

1. Apply `useApi` hook to remaining components
2. Replace custom loading spinners with `LoadingSpinner` component
3. Wrap more components with `ErrorBoundary`
4. Add more specific error handling for different error types
5. Integrate with error tracking service (e.g., Sentry)

