'use client';

import React from 'react';
import { IProduct } from '@/models/products';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SpecificationsTableProps {
    product: IProduct;
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    className?: string;
}

export default function SpecificationsTable({
    product,
    primaryColor = '#8B5CF6',
    secondaryColor,
    textColor = '#ffffff',
    className = '',
}: SpecificationsTableProps) {
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

    // Only show if there are specifications
    if (!product.specifications || product.specifications.length === 0) {
        return null;
    }

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const effectiveSecondaryColor = secondaryColor || primaryColor;

    return (
        <div className={`w-full ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr
                            className="border-b-2"
                            style={{ borderColor: primaryColor }}
                        >
                            <th
                                className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                                Specification
                            </th>
                            <th
                                className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base hidden sm:table-cell"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                                Details
                            </th>
                            <th
                                className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base sm:hidden"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {product.specifications.map((spec, index) => (
                            <React.Fragment key={index}>
                                {/* Desktop View */}
                                <tr
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hidden sm:table-row"
                                >
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                        {spec.title}
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 dark:text-gray-300 text-sm">
                                        {spec.description}
                                    </td>
                                </tr>

                                {/* Mobile View - Expandable */}
                                <tr className="border-b border-gray-200 dark:border-gray-700 sm:hidden">
                                    <td colSpan={3} className="px-4 py-3">
                                        <button
                                            onClick={() => toggleExpand(index)}
                                            className="w-full text-left p-3 rounded-lg transition-all"
                                            style={{
                                                backgroundColor: `${primaryColor}10`,
                                                borderLeft: `3px solid ${primaryColor}`,
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
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
                                                <p className="text-gray-700 dark:text-gray-300 text-sm mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
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

            {/* Summary Info */}
            <div
                className="mt-4 p-3 sm:p-4 rounded-lg text-xs sm:text-sm text-center"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
            >
                {product.specifications.length} specification{product.specifications.length !== 1 ? 's' : ''} available
            </div>
        </div>
    );
}
