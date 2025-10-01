
'use client';

import { motion } from 'framer-motion';
import { FaRobot, FaInstagram, FaWhatsapp, FaChartBar } from 'react-icons/fa';

const steps = [
    {
        icon: <FaRobot className="text-blue-600 text-3xl" />,
        title: 'Connect Your Account',
        description: 'Link your Instagram Business and WhatsApp Business accounts in a few clicks.',
    },
    {
        icon: <FaRobot className="text-green-600 text-3xl" />,
        title: 'Add Your Products',
        description: 'Upload your product images and basic info. Our AI generates descriptions and captions automatically.',
    },
    {
        icon: <FaInstagram className="text-pink-500 text-3xl" />,
        title: 'Schedule Posts',
        description: 'Choose when and where you want to publish — Instagram posts or WhatsApp messages — and let the AI do the rest.',
    },
    {
        icon: <FaChartBar className="text-purple-600 text-3xl" />,
        title: 'Grow & Track',
        description: 'Monitor engagement, reach, and sales with built-in analytics dashboards.',
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-gray-50 py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto text-center">
            <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-12"
            >
            How It Works
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
                className="bg-white shadow-md rounded-xl p-6 text-left hover:shadow-lg transition"
                >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
                </motion.div>
            ))}
            </div>
        </div>
        </section>
    );
}
