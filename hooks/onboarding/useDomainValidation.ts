import { useState, useRef, useEffect, useCallback } from 'react';

interface UseDomainValidationOptions {
    debounceMs?: number;
    minLength?: number;
}

export function useDomainValidation(options: UseDomainValidationOptions = {}) {
    const { debounceMs = 500, minLength = 3 } = options;
    const [domain, setDomain] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const normalizeDomain = useCallback((value: string): string => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }, []);

    const validateDomain = useCallback(async (domainValue: string) => {
        if (!domainValue || domainValue.trim() === '') {
            setError(null);
            setIsValid(false);
            return;
        }

        const normalized = normalizeDomain(domainValue);
        
        if (normalized.length < minLength) {
            setError(`Domain must be at least ${minLength} characters long`);
            setIsValid(false);
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            const response = await fetch('/api/store/validate-domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: normalized }),
            });

            const data = await response.json();
            
            if (data.available) {
                setIsValid(true);
                setError(null);
            } else {
                setIsValid(false);
                setError(data.error || 'This domain is already taken. Please choose another.');
            }
        } catch (error) {
            console.error('Error validating domain:', error);
            setError('Failed to validate domain. Please try again.');
            setIsValid(false);
        } finally {
            setIsValidating(false);
        }
    }, [normalizeDomain, minLength]);

    const handleDomainChange = useCallback((value: string) => {
        setDomain(value);
        setIsValid(false);
        setError(null);
        
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Auto-validate after user stops typing (debounce)
        timeoutRef.current = setTimeout(() => {
            if (value.trim()) {
                validateDomain(value);
            }
        }, debounceMs);
    }, [validateDomain, debounceMs]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const suggestDomain = useCallback((brandName: string) => {
        if (!brandName.trim()) return '';
        const suggested = normalizeDomain(brandName);
        setDomain(suggested);
        // Validate suggested domain after a short delay
        setTimeout(() => validateDomain(suggested), debounceMs);
        return suggested;
    }, [normalizeDomain, validateDomain, debounceMs]);

    return {
        domain,
        setDomain: handleDomainChange,
        isValid,
        isValidating,
        error,
        normalizeDomain,
        suggestDomain,
    };
}

