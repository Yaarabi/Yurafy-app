
'use client';

import { motion } from 'framer-motion';
import { MdCheckCircle } from 'react-icons/md';

export default function AboutSection() {
    const highlights = [
        'AI-generated product descriptions for instant, high-quality content',
        'Instagram bot for automated posting and engagement',
        'WhatsApp bot for customer communication and order updates',
        'Custom product pages to showcase and sell your products',
    ];

    return (
        <section className="bg-white py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto text-center">
            <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
            Who We Are
            </motion.h2>
            <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto"
            >
            Yura IT is a forward-thinking technology company dedicated to helping Moroccan small businesses grow online. We combine AI, automation, and expert web development to deliver smart solutions that save time and increase sales. Whether you’re a local artisan, retailer, or online seller, our tools help you reach your customers faster and smarter.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {highlights.map((item, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-3"
                >
                <MdCheckCircle className="text-blue-600 text-2xl mt-1" />
                <p className="text-gray-800 text-md">{item}</p>
                </motion.div>
            ))}
            </div>
        </div>
        </section>
    );
}
