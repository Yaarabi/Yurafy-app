
'use client';
import { IProduct } from '@/models/products';
import { motion } from 'framer-motion';

export default function ProductVariants({ variants }: { variants?: IProduct['variants'] }) {
    if (!variants || variants.length === 0) return null;

    return (
        <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        >
        <h3 className="font-semibold text-gray-800 mb-2">Available Variants</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {variants.map((variant, idx) => (
            <motion.div
                key={idx}
                className="border rounded-lg p-3 text-sm text-gray-700 shadow-sm"
                whileHover={{ scale: 1.05, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }}
            >
                {variant.size && <p>Size: {variant.size}</p>}
                {variant.color && <p>Color: {variant.color}</p>}
                {variant.price && <p>Price: {variant.price} MAD</p>}
                <p>Stock: {variant.stock ?? 0}</p>
            </motion.div>
            ))}
        </div>
        </motion.div>
    );
}
