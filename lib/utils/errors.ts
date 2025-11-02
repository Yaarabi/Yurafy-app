import { NextResponse } from "next/server";

/**
 * Standardized error response utility
 * Ensures consistent error format across all API routes
 */

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

export class ApiException extends Error {
  statusCode: number;
  code?: string;
  errors?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    errors?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.name = "ApiException";
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  errors?: Record<string, string>
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      message,
      code,
      errors,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Handle API exceptions and return standardized responses
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  if (error instanceof ApiException) {
    return createErrorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.errors
    );
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred"
        : error.message;

    return createErrorResponse(message, 500, "INTERNAL_ERROR");
  }

  return createErrorResponse("An unknown error occurred", 500, "UNKNOWN_ERROR");
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, any>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter((field) => !body[field]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

