/**
 * Frontend phone number utilities
 * Works with react-international-phone and other formats
 * 
 * This is a re-export of the backend normalizePhoneNumber function
 * to be used in client-side components
 */

// Re-export the normalize function from the backend
export { normalizePhoneNumber } from '@/lib/whatsapp/phoneNormalize';

/**
 * Format phone number for display (optional)
 * Keeps the normalized format but can be used for display purposes
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
    const normalized = normalizePhoneNumber(phoneNumber);
    // Return as-is for now, can add formatting later if needed
    return normalized;
}

