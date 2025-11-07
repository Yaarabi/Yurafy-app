# Quick Start Enhancements Guide
## Immediate Improvements with Code Examples

---

## 🚀 Quick Wins (Start Here)

### 1. Add Security Headers (30 minutes)

**File:** `next.config.ts`

```typescript
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const nextConfig: NextConfig = {
    images: {
        domains: ['picsum.photos', 'localhost'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.vercel.app',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

---

### 2. Create API Authentication Middleware (1 hour)

**File:** `lib/middleware/auth.ts` (NEW)

```typescript
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { createErrorResponse } from '@/lib/utils/errors';

/**
 * Require authentication middleware
 */
export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw createErrorResponse('Unauthorized - Authentication required', 401, 'UNAUTHORIZED');
  }
  
  return session;
}

/**
 * Require specific role middleware
 */
export async function requireRole(req: NextRequest, roles: string[]) {
  const session = await requireAuth(req);
  
  if (!roles.includes(session.user.role || '')) {
    throw createErrorResponse('Forbidden - Insufficient permissions', 403, 'FORBIDDEN');
  }
  
  return session;
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(req: NextRequest) {
  return requireRole(req, ['admin']);
}

/**
 * Wrapper for protected API routes
 */
export function withAuth(
  handler: (req: NextRequest, session: any) => Promise<Response>,
  options?: { roles?: string[] }
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const session = options?.roles
        ? await requireRole(req, options.roles)
        : await requireAuth(req);
      
      return handler(req, session);
    } catch (error: any) {
      if (error instanceof Response) {
        return error;
      }
      return createErrorResponse('Authentication failed', 401, 'UNAUTHORIZED');
    }
  };
}
```

**Usage Example:**
```typescript
// app/api/products/route.ts
import { withAuth } from '@/lib/middleware/auth';

export const POST = withAuth(async (req: NextRequest, session) => {
  // session is guaranteed to exist
  const userId = session.user.id;
  // ... rest of handler
});
```

---

### 3. Add Zod Validation Schemas (2 hours)

**File:** `lib/validation/schemas.ts` (NEW)

```typescript
import { z } from 'zod';

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(3).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  price: z.number().positive(),
  discount: z.number().nonnegative().max(100).optional(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1),
  description: z.string().optional(),
  mainImage: z.string().url(),
  images: z.array(z.string().url()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Order schemas
export const createOrderSchema = z.object({
  products: z.array(z.object({
    product: z.string().optional(),
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    color: z.string().optional(),
    size: z.string().optional(),
  })).min(1),
  totalAmount: z.number().positive(),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(8),
    address: z.string().min(1),
    city: z.string().optional(),
    country: z.string().optional(),
  }),
  deliveryInstructions: z.string().optional(),
  preferredTime: z.string().optional(),
});

// User schemas
export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).trim().optional(),
  phone: z.string().optional(),
  logo: z.string().url().optional(),
});

// Plan schemas
export const createPlanTemplateSchema = z.object({
  planKey: z.string().min(1).toLowerCase(),
  name: z.string().min(1),
  description: z.string().min(1),
  defaultPrice: z.number().nonnegative(),
  defaultDurationDays: z.number().int().positive(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  isSpecial: z.boolean().optional(),
  basePlanKey: z.string().optional(),
});
```

**File:** `lib/middleware/validation.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';
import { createErrorResponse } from '@/lib/utils/errors';

/**
 * Validate request body with Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest): Promise<{ data: T; error?: Response }> => {
    try {
      const body = await req.json();
      const data = schema.parse(body);
      return { data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return {
          data: null as any,
          error: NextResponse.json(
            {
              error: 'Validation failed',
              errors,
            },
            { status: 400 }
          ),
        };
      }
      return {
        data: null as any,
        error: createErrorResponse('Invalid request body', 400, 'INVALID_BODY'),
      };
    }
  };
}
```

**Usage:**
```typescript
// app/api/products/route.ts
import { validateBody } from '@/lib/middleware/validation';
import { createProductSchema } from '@/lib/validation/schemas';

export const POST = withAuth(async (req: NextRequest, session) => {
  const { data, error } = await validateBody(createProductSchema)(req);
  if (error) return error;
  
  // data is now type-safe and validated
  // ... create product
});
```

---

### 4. Improve Database Connection (1 hour)

**File:** `lib/db/mongoDB.ts`

```typescript
import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "@/lib/utils/logging";

dotenv.config();

let isConnected = false;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

/**
 * Connect to MongoDB with retry logic and connection pooling
 */
export const connectDB = async (retryCount = 0): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    await mongoose.connect(mongoUri, options);
    isConnected = true;

    logger.info("Database connected successfully");

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error("Database connection error", err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn("Database disconnected");
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info("Database reconnected");
      isConnected = true;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info("Database connection closed through app termination");
      process.exit(0);
    });

  } catch (error: unknown) {
    isConnected = false;
    
    if (error instanceof Error) {
      logger.error(`Database connection error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
    }

    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`Retrying database connection in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    }

    throw error;
  }
};

/**
 * Get MongoDB client for transactions
 */
export async function getMongoClient() {
  await connectDB();
  if (!mongoose.connection.db) {
    throw new Error("Database not connected");
  }
  return mongoose.connection.getClient();
}

/**
 * Check if database is connected
 */
export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
```

---

### 5. Add Request ID Tracking (30 minutes)

**File:** `lib/middleware/requestId.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Generate or get request ID from headers
 */
export function getRequestId(req: NextRequest): string {
  const existingId = req.headers.get(REQUEST_ID_HEADER);
  return existingId || uuidv4();
}

/**
 * Add request ID to response headers
 */
export function addRequestId(req: NextRequest, res: NextResponse): NextResponse {
  const requestId = getRequestId(req);
  res.headers.set(REQUEST_ID_HEADER, requestId);
  return res;
}

/**
 * Middleware to add request ID to all requests
 */
export function withRequestId(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = getRequestId(req);
    const res = await handler(req);
    res.headers.set(REQUEST_ID_HEADER, requestId);
    return res;
  };
}
```

**Install:** `npm install uuid @types/uuid`

---

### 6. Integrate Sentry for Error Tracking (1 hour)

**Install:** `npm install @sentry/nextjs`

**File:** `sentry.client.config.ts` (NEW)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
```

**File:** `sentry.server.config.ts` (NEW)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
```

**Update:** `components/common/ErrorBoundary.tsx`

```typescript
import * as Sentry from "@sentry/nextjs";

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  
  if (this.props.onError) {
    this.props.onError(error, errorInfo);
  }

  // Send to Sentry
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

---

### 7. Add Redis Rate Limiting (2 hours)

**Install:** `npm install @upstash/ratelimit @upstash/redis`

**File:** `lib/utils/rateLimit.ts` (UPDATE)

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
});

/**
 * Get client identifier from request
 */
function getClientId(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Check rate limit with Upstash
 */
export async function checkRateLimit(
  req: NextRequest
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const clientId = getClientId(req);
  const { success, remaining, reset } = await ratelimit.limit(clientId);
  
  return {
    allowed: success,
    remaining,
    reset,
  };
}

/**
 * Apply rate limit to API route
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: { limit?: number; window?: string }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const result = await checkRateLimit(req);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": new Date(result.reset).toISOString(),
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(req);
    response.headers.set("X-RateLimit-Limit", "60");
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString());
    
    return response;
  };
}
```

---

### 8. Add Environment Variable Validation with Zod (1 hour)

**File:** `lib/config/env.ts` (NEW)

```typescript
import { z } from 'zod';
import { logger } from '@/lib/utils/logging';

const envSchema = z.object({
  // Required
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // Optional
  MISTRAL_API_KEY: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_SECRET: z.string().optional(),
  PAYPAL_API_URL: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be 64 characters (32 bytes hex)').optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_PAYPAL_ID: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  
  // Sentry (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  
  // Upstash Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missing = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    logger.error('Environment variable validation failed:', {
      errors: missing,
    });
    throw new Error(`Environment variable validation failed:\n${missing.join('\n')}`);
  }
  throw error;
}

export { env };
export type { Env };
```

**Update:** `lib/utils/env.ts`

```typescript
import { env } from '@/lib/config/env';

// Re-export for backward compatibility
export function getEnvVar(name: keyof typeof env, defaultValue?: string): string {
  const value = env[name];
  if (!value && defaultValue) {
    return defaultValue;
  }
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
```

---

## 📋 Implementation Checklist

- [ ] Add security headers to `next.config.ts`
- [ ] Create API authentication middleware
- [ ] Add Zod validation schemas
- [ ] Improve database connection with retry logic
- [ ] Add request ID tracking
- [ ] Integrate Sentry for error tracking
- [ ] Add Redis rate limiting
- [ ] Add environment variable validation with Zod
- [ ] Set up testing infrastructure
- [ ] Add API documentation
- [ ] Implement caching layer
- [ ] Set up background job queue
- [ ] Add database backup strategy
- [ ] Implement API versioning
- [ ] Add performance monitoring

---

## 🎯 Next Steps

1. Start with Quick Wins (items 1-8 above)
2. Set up testing infrastructure
3. Implement caching and job queue
4. Add monitoring and observability
5. Optimize database queries
6. Add API documentation

---

*This guide provides immediate, actionable improvements to strengthen your codebase.*

