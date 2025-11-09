/**
 * Shared utility for file uploads
 * Provides consistent error handling and response parsing
 */

export interface UploadResponse {
    url: string;
    filename: string;
    size?: number;
    type?: string;
    message?: string;
}

export interface UploadError {
    message: string;
    code?: string;
    status?: number;
}

/**
 * Upload a file to the server
 * @param file - The file to upload
 * @param endpoint - The upload endpoint (default: '/api/upload')
 * @returns Promise with upload response or null if failed
 */
export async function uploadFile(
    file: File,
    endpoint: string = '/api/upload'
): Promise<{ success: true; data: UploadResponse } | { success: false; error: UploadError }> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary
        });

        // Check if response is OK
        if (!response.ok) {
            // Try to parse error response
            let errorMessage = `Upload failed (${response.status})`;
            let errorCode: string | undefined;
            
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    // API returns 'message' field, but some might use 'error'
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    errorCode = errorData.code;
                } else {
                    // If not JSON, try to get text
                    const text = await response.text();
                    if (text) {
                        errorMessage = text;
                    }
                }
            } catch (parseError) {
                // If parsing fails, use default message
                console.error('Failed to parse error response:', parseError);
            }

            return {
                success: false,
                error: {
                    message: errorMessage,
                    code: errorCode,
                    status: response.status,
                },
            };
        }

        // Parse successful response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {
                success: false,
                error: {
                    message: 'Invalid response format from server',
                    status: response.status,
                },
            };
        }

        const data = await response.json() as UploadResponse;

        if (!data.url) {
            return {
                success: false,
                error: {
                    message: data.message || 'Upload succeeded but no URL returned',
                    status: response.status,
                },
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error: any) {
        // Handle network errors, JSON parsing errors, etc.
        console.error('Upload error:', error);
        
        let errorMessage = 'Failed to upload file. Please try again.';
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: {
                message: errorMessage,
            },
        };
    }
}

/**
 * Delete uploaded files
 * @param urls - Array of file URLs to delete
 * @param endpoint - The delete endpoint (default: '/api/upload')
 * @returns Promise with deletion result
 */
export async function deleteFiles(
    urls: string[],
    endpoint: string = '/api/upload'
): Promise<{ success: boolean; deleted?: string[]; failed?: string[]; error?: string }> {
    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ urls }),
        });

        if (!response.ok) {
            let errorMessage = `Delete failed (${response.status})`;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                }
            } catch (parseError) {
                console.error('Failed to parse error response:', parseError);
            }

            return {
                success: false,
                error: errorMessage,
            };
        }

        const data = await response.json();
        return {
            success: true,
            deleted: data.deleted,
            failed: data.failed,
        };
    } catch (error: any) {
        console.error('Delete error:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete files. Please try again.',
        };
    }
}

