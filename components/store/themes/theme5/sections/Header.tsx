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
    const primaryColor = selectedStore.theme?.primaryColor || '#db2777';

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="bg-white shadow-2xl sticky top-0 z-50 border-b-4"
            style={{ borderColor: primaryColor }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center py-5">
                    <a href="/" className="flex items-center space-x-3">
                        {selectedStore.logoUrl ? (
                            <img
                                src={selectedStore.logoUrl}
                                alt={`${selectedStore.brandName} logo`}
                                className="h-14 w-auto object-contain"
                            />
                        ) : (
                            <h1 
                                className="text-3xl sm:text-4xl font-black uppercase tracking-tight"
                                style={{ color: primaryColor }}
                            >
                                {selectedStore.brandName}
                            </h1>
                        )}
                    </a>

                    <nav className="hidden md:flex items-center space-x-10">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-base font-black text-gray-800 hover:transition-colors duration-200 uppercase tracking-wider relative"
                                style={{ 
                                    color: link.href === '#about' ? primaryColor : undefined 
                                }}
                            >
                                {link.label}
                                <span 
                                    className="absolute -bottom-2 left-0 w-full h-1 opacity-0 hover:opacity-100 transition-opacity duration-300"
                                    style={{ backgroundColor: primaryColor }}
                                ></span>
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button
                            className="relative p-3 rounded-none hover:bg-gray-100 transition-colors duration-200 border-2"
                            style={{ borderColor: primaryColor }}
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon 
                                className="h-7 w-7"
                                style={{ color: primaryColor }}
                            />
                            <span 
                                className="absolute -top-2 -right-2 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
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

