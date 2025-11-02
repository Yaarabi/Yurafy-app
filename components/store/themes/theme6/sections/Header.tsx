"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { ShoppingCartIcon } from "@/components/store/components/icons";
import SearchBar from "@/components/store/components/SearchBar";
import { motion } from "framer-motion";

const Header: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();

    if (!selectedStore) return null;

    const headerLinks = [
        ...(selectedStore.headerLinks || []),
        { label: "About", href: "#about" },
        { label: "Contact Us", href: "#contact" },
    ];
    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b"
            style={{ borderColor: `${primaryColor}20` }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col space-y-4 py-4">
                    {/* Top row: Logo and Cart */}
                    <div className="flex justify-between items-center">
                        <a href="/" className="flex items-center space-x-3">
                            {selectedStore.logoUrl ? (
                                <img
                                    src={selectedStore.logoUrl}
                                    alt={`${selectedStore.brandName} logo`}
                                    className="h-12 w-auto object-contain"
                                />
                            ) : (
                                <h1 
                                    className="text-2xl sm:text-3xl font-extrabold"
                                    style={{ color: primaryColor }}
                                >
                                    {selectedStore.brandName}
                                </h1>
                            )}
                        </a>

                        <div className="flex items-center space-x-4">
                            <button
                                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                aria-label="View cart"
                            >
                                <ShoppingCartIcon 
                                    className="h-6 w-6"
                                    style={{ color: primaryColor }}
                                />
                                <span 
                                    className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    2
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom row: Search and Navigation */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-6">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-md">
                            <SearchBar 
                                primaryColor={primaryColor} 
                                onProductSelect={selectProduct}
                            />
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-wrap items-center gap-4 md:gap-8">
                            {headerLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm font-semibold text-gray-700 hover:transition-colors duration-200 relative group"
                                >
                                    {link.label}
                                    <span 
                                        className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;

