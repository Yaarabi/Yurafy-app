'use client';

import { motion } from 'framer-motion';

export default function Hero({ store }: { store: any }) {
    const brandName = store.brandName || 'Our Store';
    const heroTitle = store.hero?.title || `Welcome to ${brandName}`;
    const heroSubtitle =
        store.hero?.subtitle || 'Discover amazing products curated just for you.';
    const heroImage =
        store.hero?.imageUrl ||
        'https://www.kvindernesblaabog.dk/wp-content/uploads/2021/09/indkoebsvogn-1170x658.jpeg';

    return (
        <section
        className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden text-white"
        style={{ fontFamily: 'var(--font-family, Inter)' }}
        >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img
            src={heroImage}
            alt="Hero background"
            className="w-full h-full object-cover"
            />
            <div
            className="absolute inset-0"
            style={{
                backgroundImage:
                'linear-gradient(to right, var(--gradient-from, var(--primary-color)), var(--gradient-via, var(--primary-color)), var(--gradient-to, var(--button-color)))',
                opacity: 0.6,
            }}
            />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="max-w-3xl"
            >
            <h1
                className="text-3xl sm:text-5xl drop-shadow-md"
                style={{
                fontWeight: 'var(--heading-weight, 700)',
                }}
            >
                {heroTitle}
            </h1>
            <p className="mt-4 text-white/90 text-base sm:text-lg">
                {heroSubtitle}
            </p>
            </motion.div>
        </div>
        </section>
    );
}
