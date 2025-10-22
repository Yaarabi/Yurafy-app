'use client';

import { motion } from 'framer-motion';

export default function WhoWeAre({ store }: { store: any }) {
    return (
        <section
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-xl shadow-md mt-16"
        style={{
            backgroundImage: `linear-gradient(to right, var(--gradient-from, var(--secondary-color)), var(--gradient-via, var(--secondary-color)), var(--gradient-to, var(--primary-color)))`,
            fontFamily: 'var(--font-family, Inter)',
        }}
        >
        <motion.h2
            className="text-2xl sm:text-3xl mb-6 text-center drop-shadow-sm"
            style={{
            color: 'var(--text-color)',
            fontWeight: 'var(--heading-weight, 700)',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
        >
            Who We Are
        </motion.h2>
        <motion.p
            className="sm:text-lg leading-relaxed text-center max-w-3xl mx-auto"
            style={{ color: 'var(--text-color)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
        >
            {store.whoWeAre ||
            'We are a passionate team dedicated to bringing you the best products online. Our mission is to provide quality, reliability, and a seamless shopping experience.'}
        </motion.p>
        </section>
    );
}
