/**
 * Extended type definitions for next-intl v4.4.0
 * Supports both client and server helpers without breaking module shape
 */

import 'next-intl';
import 'next-intl/server';
import 'next-intl/client';

declare module 'next-intl' {
  export interface Messages extends Record<string, unknown> {}

  // Client hook for translations
  export function useTranslations(
    namespace?: string
  ): (key: string, values?: Record<string, any>) => string;

  // Hook to get the current locale
  export function useLocale(): string;

  // Client provider
  export const NextIntlClientProvider: React.ComponentType<{
    messages: Record<string, any>;
    locale: string;
    children: React.ReactNode;
  }>;
}

declare module 'next-intl/server' {
  // Server-only helpers (v4)
  export function getRequestConfig(
    callback: (params: { request: Request }) => Promise<{
      locale: string;
    }>
  ): (req: Request) => Promise<{ locale: string }>;

  export function getLocale(request: Request): Promise<string>;

  export function createTranslator(options: {
    locale: string;
    messages: Record<string, any>;
  }): {
    t: (key: string, values?: Record<string, any>) => string;
  };
}

declare module 'next-intl/client' {
  export function useTranslations(
    namespace?: string
  ): (key: string, values?: Record<string, any>) => string;

  export function useLocale(): string;

  export const NextIntlClientProvider: React.ComponentType<{
    messages: Record<string, any>;
    locale: string;
    children: React.ReactNode;
  }>;
}
