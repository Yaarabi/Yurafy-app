import { logger } from "./logging";

/**
 * Environment variable validation
 * Validates all required environment variables on startup
 */

interface EnvConfig {
  required: string[];
  optional?: string[];
}

const requiredEnvVars = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
];

const optionalEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "MISTRAL_API_KEY",
  "WHATSAPP_VERIFY_TOKEN",
  "NEXT_PUBLIC_BASE_URL",
];

/**
 * Validate environment variables
 */
export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    logger.error("Missing required environment variables", undefined, {
      missing,
      required: requiredEnvVars,
    });
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get environment variable with validation
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value || defaultValue || "";
}

/**
 * Validate environment variables on module load
 */
export function initializeEnvValidation(): void {
  const validation = validateEnvVars();

  if (!validation.valid) {
    const errorMessage = `Missing required environment variables: ${validation.missing.join(", ")}`;
    logger.error(errorMessage);
    
    // In production, we might want to exit, but in development, just warn
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMessage);
    }
  } else {
    logger.info("Environment variables validated successfully");
  }
}

// Validate on module load
if (typeof window === "undefined") {
  // Only run on server side
  initializeEnvValidation();
}

