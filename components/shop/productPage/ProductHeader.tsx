'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';
import { IUser } from '@/models/users';  


export function capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export default function ProductHeader({ owner }: { owner: IUser }) {
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const brandName = capitalizeFirstLetter(owner.brandName || owner.name);

    const Logo = (
        <div className="flex items-center space-x-3">
        {owner.logo ? (
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image
                src={owner.logo}
                alt={`${owner.brandName || owner.name} logo`}
                fill
                className="rounded-full object-cover border border-gray-200"
            />
            </div>
        ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold">
            {owner.name}
            </div>
        )}
        <span className="text-xl sm:text-2xl font-bold text-gray-900">
            {brandName || owner.name}
        </span>
        </div>
);

    const SearchBar = (
        <div className="flex-1 max-w-md mx-4 relative">
        <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full border border-gray-200 bg-white rounded-full px-5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <FaSearch className="absolute right-4 top-3 text-gray-400" />
        </div>
    );

    const CartButton = (
        <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        onClick={() => {
            const orderForm = document.getElementById('order-form');
            if (orderForm) {
            orderForm.scrollIntoView({ behavior: 'smooth' });
            }
        }}
        >
        <FaShoppingCart className="text-xl text-gray-700" />
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1.5 rounded-full">
            1
        </span>
        </motion.button>
    );

    return (
        <header 
        id='header'
        className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {Logo}
            </motion.div>

            {/* Search Bar */}
            {!isMobile || showMobileSearch ? SearchBar : (
                <button
                className="p-2 rounded-full hover:bg-gray-100 transition md:hidden"
                onClick={() => setShowMobileSearch(true)}
                >
                <FaSearch className="text-xl text-gray-500" />
                </button>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-3">
                <LocaleSwitcher />
                {CartButton}
            </div>
            </div>
        </div>
        </header>
    );
}
