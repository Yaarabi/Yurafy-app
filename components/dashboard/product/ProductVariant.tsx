'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Plus } from 'lucide-react';

interface ProductVariantsProps {
    sizes: string[];
    colors: string[];
    onChange: (updated: { sizes: string[]; colors: string[] }) => void;
}

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']; // Quick select options
const COLOR_OPTIONS = [
    'Black', 'White', 'Red', 'Blue', 'Green',
    'Yellow', 'Purple', 'Pink', 'Gray', 'Orange', 'Brown',
];

export default function ProductVariants({ sizes, colors, onChange }: ProductVariantsProps) {
    const [selectedSizes, setSelectedSizes] = useState<string[]>(sizes || []);
    const [selectedColors, setSelectedColors] = useState<string[]>(colors || []);
    const [newSizeInput, setNewSizeInput] = useState(''); // ✅ Added: Manual size input

    // ✅ Added: Add custom size manually
    const addCustomSize = () => {
        const size = newSizeInput.trim();
        if (size && !selectedSizes.includes(size)) {
            const updated = [...selectedSizes, size];
            setSelectedSizes(updated);
            onChange({ sizes: updated, colors: selectedColors });
            setNewSizeInput('');
        }
    };

    // ✅ Added: Remove size
    const removeSize = (size: string) => {
        const updated = selectedSizes.filter((s) => s !== size);
        setSelectedSizes(updated);
        onChange({ sizes: updated, colors: selectedColors });
    };

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
        {/* Sizes - ✅ Updated: Manual input support */}
        <div>
            <h3 className="text-gray-100 font-semibold mb-3">Available Sizes</h3>
            
            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
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

            {/* ✅ Added: Manual size input */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newSizeInput}
                    onChange={(e) => setNewSizeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomSize()}
                    placeholder="Add custom size (e.g., 40, 42, L, XL)"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="button"
                    onClick={addCustomSize}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* ✅ Added: Display selected custom sizes */}
            {selectedSizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedSizes.map((size) => (
                        <div
                            key={size}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm"
                        >
                            <span>{size}</span>
                            <button
                                type="button"
                                onClick={() => removeSize(size)}
                                className="hover:bg-indigo-700 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
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
