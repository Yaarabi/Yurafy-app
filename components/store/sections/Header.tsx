"use client";

import React from "react";
import { useStore } from "../hooks/useStore";
import { ShoppingCartIcon } from "../components/icons";
import { motion } from "framer-motion";

const Header: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const headerLinks = [
        ...(selectedStore.headerLinks || []),
        { label: "About", href: "#about" },
        { label: "Contact Us", href: "#contact" },
    ];

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
        >
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center py-4">
                    {/* Left section: Logo */}
                    <a href="/" className="flex items-center space-x-3">
                        {selectedStore.logoUrl ? (
                            <img
                                src={selectedStore.logoUrl}
                                alt={`${selectedStore.brandName} logo`}
                                className="h-10 w-auto object-contain rounded-full"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-800">
                                {selectedStore.brandName}
                            </h1>
                        )}
                    </a>

                    {/* Center navigation links */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right section: Cart icon */}
                    <div className="flex items-center space-x-4">
                        <button
                            className="relative text-gray-700 hover:text-[var(--color-primary)] transition-colors duration-200"
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon className="h-6 w-6" />
                            {/* Example badge — optional */}
                            <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full px-1.5">
                                2
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
