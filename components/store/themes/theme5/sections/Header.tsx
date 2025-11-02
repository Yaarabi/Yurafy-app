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
    const primaryColor = selectedStore.theme?.primaryColor || '#db2777';
    const cartItemsCount = getTotalItems();

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="bg-white shadow-2xl sticky top-0 z-50 border-b-4"
            style={{ borderColor: primaryColor }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between gap-4 md:gap-6 py-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center space-x-3 flex-shrink-0">
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

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-base font-black text-gray-800 hover:transition-colors duration-200 uppercase tracking-wider whitespace-nowrap"
                                style={{ 
                                    color: link.href === '#about' ? primaryColor : undefined 
                                }}
                            >
                                {link.label}
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
                            className="relative p-3 rounded-none hover:bg-gray-100 transition-colors duration-200 border-2"
                            style={{ borderColor: primaryColor }}
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon 
                                className="h-7 w-7"
                                style={{ color: primaryColor }}
                            />
                            {cartItemsCount > 0 && (
                                <span 
                                    className="absolute -top-2 -right-2 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
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
                                className="text-base font-black text-gray-800 uppercase tracking-wider"
                                style={{ 
                                    color: link.href === '#about' ? primaryColor : undefined 
                                }}
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
