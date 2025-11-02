"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { ShoppingCartIcon } from "@/components/store/components/icons";
import { motion } from "framer-motion";

const Header: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const headerLinks = [
        ...(selectedStore.headerLinks || []),
        { label: "About", href: "#about" },
        { label: "Contact Us", href: "#contact" },
    ];
    const primaryColor = selectedStore.theme?.primaryColor || '#1F2937';

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="bg-white border-b border-gray-200 sticky top-0 z-50"
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center py-6">
                    <a href="/" className="flex items-center space-x-3">
                        {selectedStore.logoUrl ? (
                            <img
                                src={selectedStore.logoUrl}
                                alt={`${selectedStore.brandName} logo`}
                                className="h-10 w-auto object-contain"
                            />
                        ) : (
                            <h1 
                                className="text-2xl sm:text-3xl font-light tracking-wide"
                                style={{ color: primaryColor }}
                            >
                                {selectedStore.brandName}
                            </h1>
                        )}
                    </a>

                    <nav className="hidden md:flex items-center space-x-12">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-light text-gray-700 hover:transition-colors duration-300 tracking-wide uppercase"
                                style={{ 
                                    color: link.href === '#about' ? primaryColor : undefined 
                                }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button
                            className="relative p-2 hover:bg-gray-100 transition-colors duration-300 rounded-full"
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon 
                                className="h-6 w-6"
                                style={{ color: primaryColor }}
                            />
                            <span 
                                className="absolute -top-1 -right-1 text-white text-xs font-light rounded-full w-5 h-5 flex items-center justify-center"
                                style={{ backgroundColor: primaryColor }}
                            >
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

