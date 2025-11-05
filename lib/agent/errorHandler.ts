/**
 * AI Agent Error Handling Utilities
 * Classifies errors and provides retry logic for transient failures
 */

export enum AIErrorType {
    RATE_LIMIT = "RATE_LIMIT",
    TIMEOUT = "TIMEOUT",
    API_ERROR = "API_ERROR",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    NETWORK_ERROR = "NETWORK_ERROR",
    UNKNOWN = "UNKNOWN"
}

export interface AIError extends Error {
    type: AIErrorType;
    retryable: boolean;
    retryAfter?: number; // seconds
    statusCode?: number;
}

/**
 * Classify AI errors for appropriate handling
 */
export function classifyAIError(err: any): AIError {
    // Rate limit errors
    if (err.response?.status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after'] || '60', 10);
        return {
            ...new Error("Rate limit exceeded"),
            type: AIErrorType.RATE_LIMIT,
            retryable: true,
            retryAfter,
            statusCode: 429
        };
    }

    // Timeout errors
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        return {
            ...new Error("Request timeout"),
            type: AIErrorType.TIMEOUT,
            retryable: true,
            retryAfter: 5
        };
    }

    // Network errors
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        return {
            ...new Error("Network error"),
            type: AIErrorType.NETWORK_ERROR,
            retryable: true,
            retryAfter: 3
        };
    }

    // Server errors (500-599)
    if (err.response?.status >= 500 && err.response?.status < 600) {
        return {
            ...new Error("API server error"),
            type: AIErrorType.API_ERROR,
            retryable: true,
            retryAfter: 10
        };
    }

    // Client errors (400-499) - usually not retryable
    if (err.response?.status >= 400 && err.response?.status < 500) {
        return {
            ...new Error(err.message || "Invalid request"),
            type: AIErrorType.INVALID_RESPONSE,
            retryable: false,
            statusCode: err.response.status
        };
    }

    // Unknown errors
    return {
        ...new Error(err.message || "Unknown error"),
        type: AIErrorType.UNKNOWN,
        retryable: false
    };
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const classified = classifyAIError(err);
            
            // Don't retry if not retryable or last attempt
            if (!classified.retryable || attempt === maxRetries - 1) {
                throw classified;
            }
            
            // Calculate delay: exponential backoff + retry-after if specified
            const exponentialDelay = baseDelay * Math.pow(2, attempt);
            const retryAfterDelay = (classified.retryAfter || 0) * 1000;
            const delay = Math.max(exponentialDelay, retryAfterDelay);
            
            console.log(`[retryWithBackoff] Attempt ${attempt + 1}/${maxRetries} failed. Retrying after ${delay}ms. Error: ${classified.type}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw classifyAIError(lastError);
}
