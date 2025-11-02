"use client";

import React from "react";
import { useStore } from "../../hooks/useStore";
import { ShoppingCartIcon } from "@/components/store/components/icons";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";

interface HeaderWithSearchProps {
    primaryColor?: string;
    headerClassName?: string;
    logoSize?: string;
    titleClassName?: string;
    navGap?: string;
    cartButtonClassName?: string;
}

/**
 * Reusable header component with search functionality
 * Can be customized with different styles per theme
 */
export const HeaderWithSearch: React.FC<HeaderWithSearchProps> = ({
    primaryColor = '#0891b2',
    headerClassName = "bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b",
    logoSize = "h-12",
    titleClassName = "text-2xl sm:text-3xl font-bold",
    navGap = "gap-4 md:gap-8",
    cartButtonClassName = "relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200",
}) => {
    const { selectedStore, selectProduct } = useStore();

    if (!selectedStore) return null;

    const headerLinks = [
        ...(selectedStore.headerLinks || []),
        { label: "About", href: "#about" },
        { label: "Contact Us", href: "#contact" },
    ];

    const finalPrimaryColor = selectedStore.theme?.primaryColor || primaryColor;

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className={headerClassName}
            style={{ borderColor: `${finalPrimaryColor}30` }}
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
                                    className={`${logoSize} w-auto object-contain`}
                                />
                            ) : (
                                <h1 
                                    className={titleClassName}
                                    style={{ color: finalPrimaryColor }}
                                >
                                    {selectedStore.brandName}
                                </h1>
                            )}
                        </a>

                        <div className="flex items-center space-x-4">
                            <button
                                className={cartButtonClassName}
                                aria-label="View cart"
                            >
                                <ShoppingCartIcon 
                                    className="h-6 w-6"
                                    style={{ color: finalPrimaryColor }}
                                />
                                <span 
                                    className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                    style={{ backgroundColor: finalPrimaryColor }}
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
                                primaryColor={finalPrimaryColor} 
                                onProductSelect={selectProduct}
                            />
                        </div>

                        {/* Navigation Links */}
                        <nav className={`flex flex-wrap items-center ${navGap}`}>
                            {headerLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm font-semibold text-gray-700 hover:transition-colors duration-200 relative py-2"
                                    style={{ 
                                        color: link.href === '#about' ? finalPrimaryColor : undefined 
                                    }}
                                >
                                    {link.label}
                                    <span 
                                        className="absolute bottom-0 left-0 w-0 h-1 hover:w-full transition-all duration-300 rounded-full"
                                        style={{ backgroundColor: finalPrimaryColor }}
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

