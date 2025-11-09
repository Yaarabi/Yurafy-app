"use client";

import React, { useState } from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { ShoppingCartIcon } from "@/components/store/components/icons";
import SearchBar from "@/components/store/components/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import GeometricDecorations from "../../shared/GeometricDecorations";
import { getStoreTranslation } from "../../../utils/translations";

const Header: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();
    const { openCart, getTotalItems } = useCart();
    const router = useRouter();
    const params = useParams();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    if (!selectedStore) return null;

    const storeLanguage = selectedStore.language || 'en';
    
    // Header links with translations based on store language
    const headerLinks = [
        { label: getStoreTranslation("about", storeLanguage), href: "#about" },
        { label: getStoreTranslation("products", storeLanguage), href: "#products" },
        { label: getStoreTranslation("contact", storeLanguage), href: "#contact" },
    ];
    const primaryColor = selectedStore.theme?.primaryColor || '#a78bfa';
    const cartItemsCount = getTotalItems();

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();

        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const parts = hostname ? hostname.split('.') : [];
        const isLocalhostSubdomain = hostname.includes('localhost') && parts.length > 1 && parts[0] !== 'localhost';
        const isProductionSubdomain = parts.length >= 3 && !hostname.includes('localhost') && !hostname.startsWith('127.0.0.1');
        const isSubdomain = isLocalhostSubdomain || isProductionSubdomain;

        if (isSubdomain) {
            // With subdomain: navigate to root
            window.location.href = '/';
            return;
        } else {
            // Without subdomain: navigate to /{locale}/{domain}
            const domain = (params as any)?.domain || selectedStore.domain;
            const locale = (params as any)?.locale || 'en';
            const href = `/${locale}/${domain}`;
            router.push(href);
        }
    };

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b-2 overflow-hidden"
            style={{ borderColor: `${primaryColor}40` }}
        >
            {/* Floral Geometric Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <GeometricDecorations type="floral" color={primaryColor} />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6 py-3 sm:py-4">
                    {/* Logo - Beauty Style with Floral Accent */}
                    <button
                        onClick={handleLogoClick}
                        className="group flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 hover:opacity-80 transition-opacity min-w-0 relative"
                    >
                        {selectedStore.logoUrl && (
                            <div className="relative">
                                <img
                                    src={selectedStore.logoUrl}
                                    alt={`${selectedStore.brandName} logo`}
                                    className="h-6 w-auto sm:h-8 md:h-10 lg:h-12 object-contain flex-shrink-0"
                                />
                                {/* Beauty Badge */}
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles className="w-3 h-3 text-purple-500" />
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h1 
                                className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold truncate"
                                style={{ color: primaryColor }}
                            >
                                {selectedStore.brandName}
                            </h1>
                        </div>
                    </button>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
                        {headerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-semibold text-gray-700 hover:transition-colors duration-200 whitespace-nowrap"
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

                    {/* Cart and Mobile Menu Button */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Login Link */}
                        <a
                            href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${(params as any)?.locale || 'en'}/login`}
                            className="hidden md:flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            style={{ color: primaryColor }}
                        >
                            Login
                        </a>
                        <button
                            onClick={openCart}
                            className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon 
                                className="h-5 w-5 sm:h-6 sm:w-6"
                                style={{ color: primaryColor }}
                            />
                            {cartItemsCount > 0 && (
                                <span 
                                    className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                </span>
                            )}
                        </button>
                        
                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" style={{ color: primaryColor }} />
                            ) : (
                                <Menu className="h-6 w-6" style={{ color: primaryColor }} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Animated Slide Down */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="md:hidden overflow-hidden border-t"
                            style={{ borderColor: `${primaryColor}20` }}
                        >
                            <div className="px-4 py-4 space-y-4 bg-white">
                                {/* Search Bar */}
                                <div className="w-full">
                                    <SearchBar 
                                        primaryColor={primaryColor} 
                                        onProductSelect={(product) => {
                                            selectProduct(product);
                                            setMobileMenuOpen(false);
                                        }}
                                    />
                                </div>
                                
                                {/* Navigation Links */}
                                <nav className="flex flex-col gap-3 pt-2">
                                    {headerLinks.map((link, index) => (
                                        <motion.a
                                            key={link.label}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="text-base font-semibold py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                            style={{ 
                                                color: link.href === '#about' ? primaryColor : '#374151',
                                                backgroundColor: link.href === '#about' ? `${primaryColor}10` : undefined
                                            }}
                                        >
                                            {link.label}
                                        </motion.a>
                                    ))}
                                    {/* Login Link */}
                                    <motion.a
                                        href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${(params as any)?.locale || 'en'}/login`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: headerLinks.length * 0.1 }}
                                        className="text-base font-semibold py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        style={{ 
                                            color: primaryColor,
                                            backgroundColor: `${primaryColor}10`
                                        }}
                                    >
                                        Login
                                    </motion.a>
                                </nav>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

export default Header;
