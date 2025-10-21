'use client';

import { motion } from 'framer-motion';

export default function Hero({ store }: { store: any }) {
    return (
        <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-[var(--primary-color)] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
            <motion.h1
            className="text-3xl sm:text-5xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            >
            Welcome to {store.brandName || 'Our Store'}
            </motion.h1>
            <motion.p
            className="text-base sm:text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            >
            {store.tagline || 'Discover amazing products curated just for you.'}
            </motion.p>

            {store.heroImage && (
            <motion.div
                className="mt-10 w-full max-w-4xl mx-auto relative h-64 sm:h-96 rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <img
                src={store.heroImage}
                alt="Hero"
                className="w-full h-full object-cover"
                />
            </motion.div>
            )}
        </div>
        </section>
    );
}
