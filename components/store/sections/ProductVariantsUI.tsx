'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProductVariantsProps {
    sizes?: string[];
    colors?: string[];
    selectedSize?: string;
    selectedColor?: string;
    onSizeSelect?: (size: string) => void;
    onColorSelect?: (color: string) => void;
    primaryColor?: string;
    stock?: number;
}

export default function ProductVariantsUI({ 
    sizes = [], 
    colors = [], 
    selectedSize,
    selectedColor,
    onSizeSelect,
    onColorSelect,
    primaryColor = '#0891b2',
    stock
}: ProductVariantsProps) {
    if (sizes.length === 0 && colors.length === 0) return null;

    return (
        <motion.div
            className="mt-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {sizes.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Size {selectedSize ? `(${selectedSize})` : ''}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => onSizeSelect?.(size)}
                                className={`px-4 py-2.5 border-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                    selectedSize === size
                                        ? 'text-white shadow-md'
                                        : 'text-gray-800 bg-white border-gray-300 hover:border-gray-400'
                                }`}
                                style={{
                                    backgroundColor: selectedSize === size ? primaryColor : 'white',
                                    borderColor: selectedSize === size ? primaryColor : undefined
                                }}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {colors.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Color {selectedColor ? `(${selectedColor})` : ''}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => onColorSelect?.(color)}
                                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 shadow-sm hover:scale-110 transition-all duration-200 ${
                                    selectedColor === color ? 'ring-2 ring-offset-2' : ''
                                }`}
                                style={{
                                    backgroundColor: color,
                                    borderColor: selectedColor === color ? primaryColor : 'rgba(0, 0, 0, 0.1)',
                                    '--tw-ring-color': selectedColor === color ? primaryColor : undefined,
                                } as React.CSSProperties}
                                title={color}
                                aria-label={`Select color: ${color}`}
                            >
                                {selectedColor === color && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Stock Status */}
            {stock !== undefined && (
                <div>
                    {stock > 0 ? (
                        <p className="text-xs text-green-600 font-medium">In Stock</p>
                    ) : (
                        <p className="text-xs text-red-600 font-medium">Out of Stock</p>
                    )}
                </div>
            )}
        </motion.div>
    );
}