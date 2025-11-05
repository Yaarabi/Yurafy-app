/**
 * Normalizes a phone number to +<country_code>... format
 * Ensures consistent phone number format across the WhatsApp automation system
 * 
 * @param phoneNumber - Phone number in any format (e.g., "1234567890", "+1234567890", "(123) 456-7890")
 * @returns Normalized phone number in +<country_code>... format
 * 
 * @example
 * normalizePhoneNumber("1234567890") // Returns "+1234567890"
 * normalizePhoneNumber("+1234567890") // Returns "+1234567890"
 * normalizePhoneNumber("(123) 456-7890") // Returns "+1234567890"
 */
export function normalizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return phoneNumber;
    
    // Remove all non-digit characters
    let normalized = phoneNumber.replace(/\D/g, "");
    
    // Add + prefix if not present
    if (!normalized.startsWith("+")) {
        normalized = "+" + normalized;
    }
    
    return normalized;
}

