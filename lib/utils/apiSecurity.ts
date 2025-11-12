/**
 * API Security Utilities
 * Provides helper functions for route protection and validation
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export interface SecurityCheckResult {
  authorized: boolean;
  userId?: string;
  role?: string;
  error?: NextResponse;
}

/**
 * Verify user is authenticated
 */
export async function requireAuth(): Promise<SecurityCheckResult> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
    role: session.user.role || 'user',
  };
}

/**
 * Verify user is admin
 */
export async function requireAdmin(): Promise<SecurityCheckResult> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== 'admin') {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
    role: 'admin',
  };
}

/**
 * Verify resource ownership
 */
export async function requireOwnership(resourceOwnerId: string): Promise<SecurityCheckResult> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Admin can access any resource
  if (session.user.role === 'admin') {
    return {
      authorized: true,
      userId: session.user.id,
      role: 'admin',
    };
  }

  // Check ownership
  if (session.user.id !== resourceOwnerId) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Forbidden - You do not own this resource' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
    role: session.user.role || 'user',
  };
}

/**
 * Input sanitization for user-provided data
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * CORS headers for public API endpoints
 */
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

/**
 * Security headers for all responses
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  return response;
}
