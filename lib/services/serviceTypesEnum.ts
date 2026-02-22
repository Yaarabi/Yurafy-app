/**
 * Service Types Enum - Single source of truth for all service types
 * Used in both MongoDB schema and form validation
 */
export const VALID_SERVICE_TYPES = [
    'Custom Website',
    'WordPress website',
    'Shopify Store',
    'Basic Store',
    'Store + WhatsApp Auto Reply',
    'Store + Delivery API Integration',
    'Full COD System (Automation)',
    'AI WhatsApp Agent Integration',
    'Other',
] as const;

export type ServiceType = (typeof VALID_SERVICE_TYPES)[number];

/**
 * Validates if a service type is valid
 */
export function isValidServiceType(type: any): type is ServiceType {
    if (typeof type !== 'string') return false;
    return (VALID_SERVICE_TYPES as readonly string[]).includes(type);
}

/**
 * Type-safe includes check for service types - accepts string to avoid TS errors
 */
export function isServiceTypeInList(type: string): boolean {
    return (VALID_SERVICE_TYPES as readonly string[]).includes(type);
}

/**
 * Gets the error message for invalid service type
 */
export function getInvalidServiceTypeError(type: any): string {
    return `Invalid service type "${type}". Valid options are: ${VALID_SERVICE_TYPES.join(', ')}`;
}
