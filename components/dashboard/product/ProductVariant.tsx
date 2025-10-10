'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProductVariantsProps {
    sizes: string[];
    colors: string[];
    onChange: (updated: { sizes: string[]; colors: string[] }) => void;
}

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS = [
    'Black', 'White', 'Red', 'Blue', 'Green',
    'Yellow', 'Purple', 'Pink', 'Gray', 'Orange', 'Brown',
];

export default function ProductVariants({ sizes, colors, onChange }: ProductVariantsProps) {
    const [selectedSizes, setSelectedSizes] = useState<string[]>(sizes || []);
    const [selectedColors, setSelectedColors] = useState<string[]>(colors || []);

    const toggleSize = (size: string) => {
        const updated = selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size];
        setSelectedSizes(updated);
        onChange({ sizes: updated, colors: selectedColors });
    };

    const toggleColor = (color: string) => {
        const updated = selectedColors.includes(color)
        ? selectedColors.filter((c) => c !== color)
        : [...selectedColors, color];
        setSelectedColors(updated);
        onChange({ sizes: selectedSizes, colors: updated });
    };

    return (
        <div className="flex flex-col gap-8 mt-6">
        {/* Sizes */}
        <div>
            <h3 className="text-gray-100 font-semibold mb-3">Available Sizes</h3>
            <div className="flex flex-wrap gap-3">
            {SIZE_OPTIONS.map((size) => {
                const isActive = selectedSizes.includes(size);
                return (
                <motion.button
                    key={size}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    isActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    {size}
                </motion.button>
                );
            })}
            </div>
        </div>

        {/* Colors */}
        <div>
            <h3 className="text-gray-100 font-semibold mb-3">Available Colors</h3>
            <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((color) => {
                const isActive = selectedColors.includes(color);
                return (
                <motion.button
                    key={color}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleColor(color)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all ${
                    isActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    <span
                    className="w-4 h-4 rounded-full border border-gray-500"
                    style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span>{color}</span>
                    {isActive && <Check className="w-4 h-4 text-white" />}
                </motion.button>
                );
            })}
            </div>
        </div>
        </div>
    );
}
