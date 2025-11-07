/**
 * Normalizes a phone number to E.164 format (+countrycode+number)
 * Ensures consistent phone number format across the WhatsApp automation system
 * 
 * Handles various input formats:
 * - "+212 6123 45678" (react-international-phone format)
 * - "212612345678" (digits only)
 * - "+212612345678" (already normalized)
 * - "(212) 6123-45678" (formatted)
 * 
 * @param phoneNumber - Phone number in any format
 * @returns Normalized phone number in E.164 format (+countrycode+number)
 * 
 * @example
 * normalizePhoneNumber("+212 6123 45678") // Returns "+212612345678"
 * normalizePhoneNumber("212612345678") // Returns "+212612345678"
 * normalizePhoneNumber("+212612345678") // Returns "+212612345678"
 * normalizePhoneNumber("(212) 6123-45678") // Returns "+212612345678"
 */
export function normalizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return phoneNumber || '';
    }
    
    // Trim whitespace
    const trimmed = phoneNumber.trim();
    
    // If empty after trimming, return empty string
    if (!trimmed) {
        return '';
    }
    
    // Remove all non-digit characters (keeps only digits)
    // This removes +, spaces, dashes, parentheses, etc.
    const digitsOnly = trimmed.replace(/\D/g, "");
    
    // If empty after removing non-digits, return empty string
    if (!digitsOnly) {
        return '';
    }
    
    // Add + prefix (E.164 format: +countrycode+number)
    // E.164 format always starts with +
    return "+" + digitsOnly;
}

/**
 * Validates if a phone number is in valid E.164 format
 * @param phoneNumber - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    const normalized = normalizePhoneNumber(phoneNumber);
    // E.164: + followed by 1-15 digits
    return /^\+[1-9]\d{1,14}$/.test(normalized);
}

