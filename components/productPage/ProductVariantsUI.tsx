
'use client';

import { motion } from 'framer-motion';

interface ProductVariantsProps {
    sizes?: string[];
    colors?: string[];
}

export default function ProductVariantsUI({ sizes = [], colors = [] }: ProductVariantsProps) {
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
            <h3
                className="font-semibold mb-2"
                style={{
                color: 'var(--primary-color)',
                }}
            >
                Tailles disponibles
            </h3>
            <div className="flex flex-wrap gap-2">
                {sizes.map((size, idx) => (
                <button
                    key={idx}
                    className="px-4 py-2 border rounded-lg text-sm text-gray-800 transition-all"
                >
                    {size}
                </button>
                ))}
            </div>
            </div>
        )}

        {colors.length > 0 && (
            <div>
            <h3
                className="font-semibold mb-2"
                style={{
                color: 'var(--primary-color)',
                }}
            >
                Couleurs disponibles
            </h3>
            <div className="flex flex-wrap gap-2">
                {colors.map((color, idx) => (
                <button
                    key={idx}
                    className="w-8 h-8 sm:w-6 sm:h-6 rounded-full border shadow-sm hover:scale-105 transition-transform"
                    style={{
                    backgroundColor: color,
                    borderColor: 'var(--primary-color)',
                    }}
                    title={color}
                />
                ))}
            </div>
            </div>
        )}
        </motion.div>
    );
}