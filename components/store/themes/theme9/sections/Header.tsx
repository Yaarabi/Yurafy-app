"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { ShoppingCartIcon } from "@/components/store/components/icons";
import SearchBar from "@/components/store/components/SearchBar";
import { motion } from "framer-motion";

const Header: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();
    const { openCart, getTotalItems } = useCart();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore) return null;

    // Constant header links
    const headerLinks = [
        { label: "About", href: "#about" },
        { label: "Products", href: "#products" },
        { label: "Contact", href: "#contact" },
    ];
    const primaryColor = selectedStore.theme?.primaryColor || '#F59E0B';
    const cartItemsCount = getTotalItems();

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();

        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const parts = hostname ? hostname.split('.') : [];
        const isLocalhostSubdomain = hostname.includes('localhost') && parts.length > 1 && parts[0] !== 'localhost';
        const isProductionSubdomain = parts.length >= 3 && !hostname.includes('localhost') && !hostname.startsWith('127.0.0.1');
        const isSubdomain = isLocalhostSubdomain || isProductionSubdomain;

        const locale = (params as any)?.locale || "en";
        let href: string;
        if (isSubdomain) {
            // With subdomain: navigate to root (middleware will rewrite to /en/subdomain)
            // Use window.location for full page reload to ensure URL updates
            window.location.href = '/';
            return;
        } else {
            // Without subdomain: navigate to /locale/domain
            const locale = (params as any)?.locale || "en";
            const domain = (params as any)?.domain || selectedStore.domain;
            href = `/${locale}/${domain}`;
            router.push(href);
        }
    };

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="bg-white shadow-2xl sticky top-0 z-50 border-b-4"
            style={{ borderColor: primaryColor }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6 py-3 sm:py-4">
                    {/* Logo - Always show both logo and brand name */}
                    <button
                        onClick={handleLogoClick}
                        className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 hover:opacity-80 transition-opacity min-w-0"
                    >
                        {selectedStore.logoUrl && (
                            <img
                                src={selectedStore.logoUrl}
                                alt={`${selectedStore.brandName} logo`}
                                className="h-6 w-auto sm:h-8 md:h-10 lg:h-12 object-contain flex-shrink-0"
                            />
                        )}
                        <h1 
                            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black uppercase tracking-tight truncate"
                            style={{ color: primaryColor }}
                        >
                            {selectedStore.brandName}
                        </h1>
                    </button>

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
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Login Link */}
                        <a
                            href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${(params as any)?.locale || 'en'}/login`}
                            className="hidden md:flex items-center px-3 py-1.5 text-sm font-semibold rounded-none hover:bg-gray-100 transition-colors duration-200 border-2"
                            style={{ color: primaryColor, borderColor: primaryColor }}
                        >
                            Login
                        </a>
                        <button
                            onClick={openCart}
                            className="relative p-1.5 sm:p-2 md:p-3 rounded-none hover:bg-gray-100 transition-colors duration-200 border-2"
                            style={{ borderColor: primaryColor }}
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon 
                                className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
                                style={{ color: primaryColor }}
                            />
                            {cartItemsCount > 0 && (
                                <span 
                                    className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 md:-top-2 md:-right-2 text-white text-[10px] sm:text-xs font-black rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center border-2 border-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
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
                        {/* Login Link */}
                        <a
                            href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${(params as any)?.locale || 'en'}/login`}
                            className="text-base font-black uppercase tracking-wider"
                            style={{ color: primaryColor }}
                        >
                            Login
                        </a>
                    </nav>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
