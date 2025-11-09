"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDomainValidation } from '@/hooks/onboarding/useDomainValidation';
import DomainInput from './forms/DomainInput';
import LogoUpload from './forms/LogoUpload';

interface StoreBasicInfoFormProps {
    selectedTheme: {
        themeId: number;
        theme: { primaryColor: string; secondaryColor?: string; textColor?: string };
    };
    onSubmit: (data: { brandName: string; domain: string; description: string; logo?: string; language?: string }) => void;
    onBack?: () => void;
}

export default function StoreBasicInfoForm({ selectedTheme, onSubmit, onBack }: StoreBasicInfoFormProps) {
    const [brandName, setBrandName] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState<string>('en');
    const params = useParams();
    
    // Use domain validation hook
    const {
        domain,
        setDomain,
        isValid: isValidDomain,
        isValidating: validatingDomain,
        error: domainError,
        normalizeDomain,
        suggestDomain,
    } = useDomainValidation();

    // Logo state
    const [logo, setLogo] = useState<string>('');
    
    // Get locale from params to set default language
    useEffect(() => {
        const localeRaw = String(params?.locale || 'en');
        const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
        if (['en', 'fr', 'ar'].includes(locale)) {
            setLanguage(locale);
        }
    }, [params]);

    const handleBrandNameChange = (value: string) => {
        setBrandName(value);
        // Auto-suggest domain if empty
        if (!domain && value.trim()) {
            suggestDomain(value);
        }
    };

    const handleDomainChange = (value: string) => {
        setDomain(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!brandName.trim()) {
            return;
        }
        
        if (!domain.trim() || !isValidDomain) {
            return;
        }

        if (!description.trim() || description.trim().length < 20) {
            return;
        }

        onSubmit({
            brandName: brandName.trim(),
            domain: normalizeDomain(domain.trim()),
            description: description.trim(),
            logo: logo || undefined,
            language: language,
        });
    };

    const primaryColor = selectedTheme.theme.primaryColor;
    const isFormValid = brandName.trim().length > 0 && 
                        domain.trim().length >= 3 && 
                        isValidDomain && 
                        description.trim().length >= 20;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex items-center justify-center pb-24 sm:pb-6">
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-base"
                                style={{ outlineColor: primaryColor }}
                                required
                            />
                        </div>

                        {/* Domain */}
                        <DomainInput
                            value={domain}
                            onChange={handleDomainChange}
                            isValid={isValidDomain}
                            isValidating={validatingDomain}
                            error={domainError}
                            primaryColor={primaryColor}
                        />

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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none text-base"
                                style={{ outlineColor: primaryColor }}
                                required
                                minLength={20}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {description.length}/20 minimum characters
                            </p>
                        </div>

                        {/* Language Selection */}
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                                Store Language <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-base"
                                style={{ outlineColor: primaryColor }}
                                required
                            >
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="ar">العربية</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Select the language for your store content
                            </p>
                        </div>

                        {/* Logo Upload */}
                        <LogoUpload
                            value={logo}
                            onChange={(url) => setLogo(url || '')}
                            primaryColor={primaryColor}
                        />

                        {/* Actions - Hidden on mobile, shown on desktop */}
                        <div className="hidden sm:flex flex-col sm:flex-row gap-3 pt-4">
                            {onBack && (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 px-6 py-3.5 sm:py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all touch-manipulation"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className={`flex-1 px-6 py-3.5 sm:py-3 rounded-lg font-medium text-white text-base transition-all touch-manipulation ${
                                    isFormValid 
                                        ? 'hover:opacity-90 hover:shadow-lg active:scale-95' 
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                                style={{ backgroundColor: isFormValid ? primaryColor : '#9CA3AF' }}
                            >
                                Generate Store
                            </button>
                        </div>
                        
                        {/* Fixed Submit Button for Mobile */}
                        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 p-4 safe-area-inset-bottom">
                            <div className="max-w-2xl mx-auto flex gap-3">
                                {onBack && (
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="flex-1 px-6 py-3.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all touch-manipulation"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`flex-1 px-6 py-3.5 rounded-lg font-medium text-white text-base transition-all touch-manipulation ${
                                        isFormValid 
                                            ? 'hover:opacity-90 hover:shadow-lg active:scale-95' 
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                    style={{ backgroundColor: isFormValid ? primaryColor : '#9CA3AF' }}
                                >
                                    Generate Store
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

