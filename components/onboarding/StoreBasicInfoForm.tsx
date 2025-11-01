"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface StoreBasicInfoFormProps {
    selectedTheme: {
        themeId: number;
        theme: { primaryColor: string; secondaryColor?: string; textColor?: string };
    };
    onSubmit: (data: { brandName: string; domain: string; description: string }) => void;
    onBack?: () => void;
}

export default function StoreBasicInfoForm({ selectedTheme, onSubmit, onBack }: StoreBasicInfoFormProps) {
    const [brandName, setBrandName] = useState('');
    const [domain, setDomain] = useState('');
    const [description, setDescription] = useState('');
    const [validatingDomain, setValidatingDomain] = useState(false);
    const [domainError, setDomainError] = useState<string | null>(null);
    const [isValidDomain, setIsValidDomain] = useState(false);
    const domainValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const normalizeDomain = (value: string): string => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const validateDomain = async (domainValue: string) => {
        if (!domainValue || domainValue.trim() === '') {
            setDomainError(null);
            setIsValidDomain(false);
            return;
        }

        const normalized = normalizeDomain(domainValue);
        if (normalized !== domainValue) {
            setDomain(normalized);
        }

        if (normalized.length < 3) {
            setDomainError('Domain must be at least 3 characters long');
            setIsValidDomain(false);
            return;
        }

        setValidatingDomain(true);
        setDomainError(null);

        try {
            const response = await fetch('/api/store/validate-domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: normalized }),
            });

            const data = await response.json();
            
            if (data.available) {
                setIsValidDomain(true);
                setDomainError(null);
            } else {
                setIsValidDomain(false);
                setDomainError(data.error || 'This domain is already taken. Please choose another.');
            }
        } catch (error) {
            console.error('Error validating domain:', error);
            setDomainError('Failed to validate domain. Please try again.');
            setIsValidDomain(false);
        } finally {
            setValidatingDomain(false);
        }
    };

    const handleDomainChange = (value: string) => {
        setDomain(value);
        setIsValidDomain(false);
        setDomainError(null);
        
        // Clear previous timeout
        if (domainValidationTimeoutRef.current) {
            clearTimeout(domainValidationTimeoutRef.current);
        }
        
        // Auto-validate after user stops typing (debounce)
        domainValidationTimeoutRef.current = setTimeout(() => {
            if (value.trim()) {
                validateDomain(value);
            }
        }, 500);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (domainValidationTimeoutRef.current) {
                clearTimeout(domainValidationTimeoutRef.current);
            }
        };
    }, []);

    const handleBrandNameChange = (value: string) => {
        setBrandName(value);
        // Auto-suggest domain if empty
        if (!domain && value.trim()) {
            const suggested = normalizeDomain(value);
            setDomain(suggested);
            // Validate suggested domain
            setTimeout(() => validateDomain(suggested), 500);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!brandName.trim()) {
            return;
        }
        
        if (!domain.trim() || !isValidDomain) {
            setDomainError('Please enter a valid and available domain');
            return;
        }

        if (!description.trim() || description.trim().length < 20) {
            return;
        }

        onSubmit({
            brandName: brandName.trim(),
            domain: normalizeDomain(domain.trim()),
            description: description.trim(),
        });
    };

    const primaryColor = selectedTheme.theme.primaryColor;
    const isFormValid = brandName.trim().length > 0 && 
                        domain.trim().length >= 3 && 
                        isValidDomain && 
                        description.trim().length >= 20;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div 
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            🏪
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Store Basic Information
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Tell us about your brand to get started
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Brand Name */}
                        <div>
                            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="brandName"
                                type="text"
                                value={brandName}
                                onChange={(e) => handleBrandNameChange(e.target.value)}
                                placeholder="e.g., My Awesome Store"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                style={{ focusRingColor: primaryColor }}
                                required
                            />
                        </div>

                        {/* Domain */}
                        <div>
                            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                                Store Domain <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-2">yura.com/</span>
                                    <div className="flex-1">
                                        <input
                                            id="domain"
                                            type="text"
                                            value={domain}
                                            onChange={(e) => handleDomainChange(e.target.value)}
                                            placeholder="my-awesome-store"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                                                domainError ? 'border-red-500' : isValidDomain ? 'border-green-500' : 'border-gray-300'
                                            }`}
                                            style={{ focusRingColor: primaryColor }}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {validatingDomain && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                                
                                {!validatingDomain && domain && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isValidDomain ? (
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </div>
                            {domainError && (
                                <p className="mt-1 text-sm text-red-600">{domainError}</p>
                            )}
                            {isValidDomain && (
                                <p className="mt-1 text-sm text-green-600">✓ Domain is available!</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                This will be your store URL: yura.com/{domain || 'your-domain'}
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Store Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Briefly describe your store, products, or services... (at least 20 characters)"
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none"
                                style={{ focusRingColor: primaryColor }}
                                required
                                minLength={20}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {description.length}/20 minimum characters
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            {onBack && (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all ${
                                    isFormValid 
                                        ? 'hover:opacity-90 hover:shadow-lg transform hover:scale-[1.02]' 
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                                style={{ backgroundColor: isFormValid ? primaryColor : '#9CA3AF' }}
                            >
                                Generate Store
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

