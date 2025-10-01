'use client';

import { motion } from 'framer-motion';
import { FaInstagram, FaWhatsapp, FaChartLine } from 'react-icons/fa';
import Image from 'next/image';

export default function HeroSection() {
    return (
        <section className="bg-gradient-to-br from-white to-gray-100 py-20 px-6 md:px-16">
            <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
                
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1"
                >
                    {/* Logo */}
                    <div className="mb-6">
                        <Image
                            src="/logo.png"
                            alt="Yura IT Logo"
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Yura IT – AI-Powered Automation for Moroccan SMEs
                    </h1>
                    <p className="text-lg text-gray-700 mb-6">
                        Simplify your social media, boost sales, and save time with AI-generated product content, Instagram & WhatsApp automation, and custom product pages.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                            Get Started Free
                        </button>
                        <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
                            Learn More
                        </button>
                    </div>
                </motion.div>

                {/* Visual Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1"
                >
                    <div className="relative w-full h-[400px]">
                        <Image
                            src="/uihome.png"
                            alt="Seller dashboard mockup"
                            layout="fill"
                            objectFit="contain"
                            className="rounded-xl shadow-lg"
                        />
                        {/* Moroccan-themed icons */}
                        <div className="absolute bottom-4 left-4 flex gap-4 text-2xl text-blue-600">
                            <FaInstagram />
                            <FaWhatsapp />
                            <FaChartLine />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
