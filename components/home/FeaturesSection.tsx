
'use client';

import { motion } from 'framer-motion';
import { MdDescription, MdWeb } from 'react-icons/md';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

const features = [
    {
        icon: <MdDescription className="text-blue-600 text-4xl" />,
        title: 'AI Product Descriptions',
        description: 'Generate persuasive product descriptions in Arabic, French, and English.',
    },
    {
        icon: <MdWeb className="text-green-600 text-4xl" />,
        title: 'Product Pages',
        description: 'Custom landing pages for each product, ready to share with customers.',
    },
    {
        icon: <FaInstagram className="text-pink-500 text-4xl" />,
        title: 'Instagram Bot',
        description: 'Schedule posts, hashtags, and captions automatically.',
    },
    {
        icon: <FaWhatsapp className="text-teal-500 text-4xl" />,
        title: 'WhatsApp Bot',
        description: 'Automate messages, order updates, and broadcast campaigns.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="bg-white py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto text-center">
            <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-12"
            >
            All-in-One Automation for Sellers
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
                >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
            ))}
            </div>
        </div>
        </section>
    );
}
