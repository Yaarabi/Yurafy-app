"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { ShoppingCartIcon } from "@/components/store/components/icons";
import SearchBar from "@/components/store/components/SearchBar";
import { motion } from "framer-motion";

const Header: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();
    const { openCart, getTotalItems } = useCart();

    if (!selectedStore) return null;

    // Constant header links
    const headerLinks = [
        { label: "About", href: "#about" },
        { label: "Products", href: "#products" },
        { label: "Contact", href: "#contact" },
    ];
    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';
    const cartItemsCount = getTotalItems();

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b"
            style={{ borderColor: `${primaryColor}20` }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between gap-4 md:gap-6 py-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center space-x-3 flex-shrink-0">
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

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-semibold text-gray-700 hover:transition-colors duration-200 relative group whitespace-nowrap"
                            >
                                {link.label}
                                <span 
                                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                    style={{ backgroundColor: primaryColor }}
                                ></span>
                            </a>
                        ))}
                    </nav>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md hidden lg:block">
                        <SearchBar 
                            primaryColor={primaryColor} 
                            onProductSelect={selectProduct}
                        />
                    </div>

                    {/* Cart */}
                    <div className="flex items-center space-x-4 flex-shrink-0">
                        <button
                            onClick={openCart}
                            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon 
                                className="h-6 w-6"
                                style={{ color: primaryColor }}
                            />
                            {cartItemsCount > 0 && (
                                <span 
                                    className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {cartItemsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile: Search and Navigation below */}
                <div className="md:hidden flex flex-col gap-3 pb-4">
                    <div className="flex-1">
                        <SearchBar 
                            primaryColor={primaryColor} 
                            onProductSelect={selectProduct}
                        />
                    </div>
                    <nav className="flex items-center gap-4">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-semibold text-gray-700"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
