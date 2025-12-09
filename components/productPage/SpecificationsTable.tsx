'use client';

import React from 'react';
import { IProduct } from '@/models/store/products';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SpecificationsTableProps {
    product: IProduct;
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    className?: string;
    storeLanguage?: string;
}

export default function SpecificationsTable({
    product,
    primaryColor = '#8B5CF6',
    secondaryColor,
    textColor = '#ffffff',
    className = '',
    storeLanguage = 'en',
}: SpecificationsTableProps) {
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
    
    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
    
    // Determine RTL direction for Arabic
    const isRTL = storeLanguage === 'ar';

    // Translation labels based on store language
    const labels = {
        en: {
            specification: 'Specification',
            details: 'Details',
            actions: 'Actions',
            available: 'available',
        },
        ar: {
            specification: 'المواصفات',
            details: 'التفاصيل',
            actions: 'الإجراءات',
            available: 'متاح',
        },
        fr: {
            specification: 'Spécification',
            details: 'Détails',
            actions: 'Actions',
            available: 'disponible',
        },
    };

    // Get language-specific labels
    const lang = labels[storeLanguage as keyof typeof labels] || labels.en;

    // Guard against undefined specifications
    if (!product.specifications || product.specifications.length === 0) {
        return null;
    }

    return (
        <div id="specifications-table" className={`w-full ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr
                            className="border-b-2"
                            style={{ borderColor: primaryColor }}
                        >
                            <th
                                className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base ${isRTL ? 'text-right' : 'text-left'}`}
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                                {lang.specification}
                            </th>
                            <th
                                className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base hidden sm:table-cell ${isRTL ? 'text-right' : 'text-left'}`}
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                                {lang.details}
                            </th>
                            <th
                                className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base sm:hidden"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                                {lang.actions}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {product.specifications!.map((spec, index) => (
                            <React.Fragment key={index}>
                                {/* Desktop View */}
                                <tr
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hidden sm:table-row"
                                >
                                    <td className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {spec.title}
                                    </td>
                                    <td className={`px-4 sm:px-6 py-3 sm:py-4 text-gray-700 dark:text-gray-300 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {spec.description}
                                    </td>
                                </tr>

                                {/* Mobile View - Expandable */}
                                <tr className="border-b border-gray-200 dark:border-gray-700 sm:hidden">
                                    <td colSpan={3} className="px-4 py-3">
                                        <button
                                            onClick={() => toggleExpand(index)}
                                            className={`w-full p-3 rounded-lg transition-all`}
                                            style={{
                                                backgroundColor: `${primaryColor}10`,
                                                borderLeft: isRTL ? 'none' : `3px solid ${primaryColor}`,
                                                borderRight: isRTL ? `3px solid ${primaryColor}` : 'none',
                                            }}
                                        >
                                            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
                                                <div className="flex-1">
                                                    <h4 className={`font-semibold text-gray-900 dark:text-gray-100 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                                        {spec.title}
                                                    </h4>
                                                </div>
                                                {expandedIndex === index ? (
                                                    <ChevronUp
                                                        className="w-5 h-5 flex-shrink-0"
                                                        style={{ color: primaryColor }}
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        className="w-5 h-5 flex-shrink-0"
                                                        style={{ color: primaryColor }}
                                                    />
                                                )}
                                            </div>

                                            {expandedIndex === index && (
                                                <p className={`text-gray-700 dark:text-gray-300 text-sm mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    {spec.description}
                                                </p>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
