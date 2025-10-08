
'use client';
import { motion } from 'framer-motion';

export default function RelatedProducts() {
    return (
        <motion.section
        className="max-w-7xl mx-auto mt-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
        <p className="text-gray-500">Related products will appear here.</p>
        </motion.section>
    );
}
