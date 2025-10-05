'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import LocaleSwitcher from '../home/LocaleSwitcher';

export default function Header() {
    const t = useTranslations('shop');

    return (
        <header className="w-full backdrop-blur-md bg-white/70 border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            {/* Logo */}
            <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center space-x-3"
            >
            <div className="relative">
                <div className="absolute inset-0 blur-md rounded-full" />
                <Image
                src="/logo.png"
                alt="Yura Logo"
                width={42}
                height={42}
                className="relative z-10"
                />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Yura
            </span>
            </motion.div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 hidden md:flex relative">
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className="w-full border border-gray-200 bg-white/80 rounded-full px-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
                />
                <FaSearch className="absolute right-4 top-3 text-gray-400" />
            </div>

            {/* Right controls: LocaleSwitcher + Cart */}
            <div className="flex items-center space-x-4">
                <LocaleSwitcher />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition"
                >
                    <FaShoppingCart className="text-2xl text-gray-700" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] px-1.5 rounded-full">
                    2
                    </span>
                </motion.button>
            </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
            <div className="relative">
            <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full border border-gray-200 bg-white rounded-full px-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
            />
            <FaSearch className="absolute right-4 top-3 text-gray-400" />
            </div>
        </div>
        </header>
    );
}
