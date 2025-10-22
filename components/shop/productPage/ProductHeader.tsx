'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';
import { SerializedStore } from '@/lib/data/products';


export function capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}


export default function ProductHeader({ store }: { store: SerializedStore }) {
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const brandName = store.brandName?.charAt(0).toUpperCase() + store.brandName?.slice(1);

    return (
        <header
        id="header"
        className="sticky top-0 z-40 w-full backdrop-blur-md border-b shadow-sm"
        style={{ backgroundColor: 'var(--header-color)' }}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
            {/* Logo + Brand */}
            <div className="flex items-center space-x-3">
            {store.logoUrl ? (
                <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image
                    src={'/logo.png'}
                    alt={`${store.brandName} logo`}
                    fill
                    className="rounded-full object-cover border border-gray-300"
                />
                </div>
            ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold">
                {store.brandName.charAt(0).toUpperCase()}
                </div>
            )}
            <span className="text-xl sm:text-2xl font-bold text-[var(--text-color)]">
                {brandName}
            </span>
            </div>

            {/* Search */}
            {!isMobile || showMobileSearch ? (
            <div className="flex-1 max-w-md mx-4 relative">
                <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-gray-300 bg-white rounded-full px-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
                />
                <FaSearch className="absolute right-4 top-3 text-gray-400" />
            </div>
            ) : (
            <button
                className="p-2 rounded-full hover:bg-gray-100 transition md:hidden"
                onClick={() => setShowMobileSearch(true)}
            >
                <FaSearch className="text-xl text-gray-500" />
            </button>
            )}

            {/* Locale + Cart */}
            <div className="flex items-center space-x-3">
            <LocaleSwitcher />
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
                onClick={() => {
                const orderForm = document.getElementById('order-form');
                if (orderForm) orderForm.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ color: 'var(--text-color)' }}
            >
                <FaShoppingCart className="text-xl" />
                <span className="absolute -top-1 -right-1 bg-[var(--primary-color)] text-white text-[10px] px-1.5 rounded-full">
                1
                </span>
            </motion.button>
            </div>
        </div>
        </header>
    );
}
