
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
        style={{ fontFamily: 'var(--font-family, Inter)' }}
        >
        {sizes.length > 0 && (
            <div>
            <h3
                className="font-semibold mb-2"
                style={{
                color: 'var(--text-color)',
                fontWeight: 'var(--heading-weight, 600)',
                }}
            >
                Tailles disponibles
            </h3>
            <div className="flex flex-wrap gap-2">
                {sizes.map((size, idx) => (
                <span
                    key={idx}
                    className="px-3 py-1 border rounded-lg text-sm transition-all"
                    style={{
                    color: 'var(--text-color)',
                    backgroundColor: 'var(--secondary-color)',
                    borderColor: 'var(--primary-color)',
                    }}
                >
                    {size}
                </span>
                ))}
            </div>
            </div>
        )}

        {colors.length > 0 && (
            <div>
            <h3
                className="font-semibold mb-2"
                style={{
                color: 'var(--text-color)',
                fontWeight: 'var(--heading-weight, 600)',
                }}
            >
                Couleurs disponibles
            </h3>
            <div className="flex flex-wrap gap-2">
                {colors.map((color, idx) => (
                <span
                    key={idx}
                    className="w-6 h-6 rounded-full border shadow-sm hover:scale-105 transition-transform"
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