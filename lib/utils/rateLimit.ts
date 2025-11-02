import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logging";

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based solution (Upstash, etc.)
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Default configurations
export const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

const STRICT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

/**
 * Get client identifier from request
 */
function getClientId(req: NextRequest): string {
  // Try to get IP from headers (for proxies)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "unknown";

  return ip;
}

/**
 * Check rate limit
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientId = getClientId(req);
  const now = Date.now();

  // Clean up expired entries
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  // Get or create entry
  let entry = store[clientId];

  if (!entry || entry.resetTime < now) {
    // New window
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    store[clientId] = entry;
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;

  if (entry.count > config.maxRequests) {
    logger.warn("Rate limit exceeded", { clientId, count: entry.count });
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware factory
 */
export function rateLimitMiddleware(
  config: RateLimitConfig = DEFAULT_CONFIG
) {
  return (req: NextRequest): NextResponse | null => {
    const result = checkRateLimit(req, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    // This will be handled by the API route itself
    return null;
  };
}

/**
 * Apply rate limit to API route
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = DEFAULT_CONFIG
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const result = checkRateLimit(req, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Call the handler
    const response = await handler(req);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

    return response;
  };
}

/**
 * Get strict rate limit config for sensitive operations
 */
export function getStrictRateLimit() {
  return STRICT_CONFIG;
}

