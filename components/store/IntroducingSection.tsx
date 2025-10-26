'use client';

import { motion } from 'framer-motion';

type Props = {
  whoWeAre?: string;
};

export default function WhoWeAre({ whoWeAre }: Props) {
  return (
    <section
    id='#about'
      className="py-12 sm:py-20 px-4 sm:px-6 bg-[var(--primary-color)] text-[var(--text-color)]"
    >
      <div className="max-w-screen-2xl mx-auto text-center px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 max-md:text-3xl max-sm:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          ABOUT US
        </motion.h2>

        <motion.p
          className="max-w-3xl mx-auto text-base sm:text-lg font-normal max-md:text-base max-sm:text-sm leading-relaxed px-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          {whoWeAre ||
            'We are a passionate team dedicated to bringing you the best products online. Our mission is to provide quality, reliability, and a seamless shopping experience.'}
        </motion.p>
      </div>
    </section>
  );
}
