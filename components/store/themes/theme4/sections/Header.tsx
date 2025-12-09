"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { ShoppingCartIcon } from "@/components/store/components/icons";
import SearchBar from "@/components/store/components/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { getStoreTranslation } from "../../../utils/translations";

const Header: React.FC = () => {
    const { selectedStore, selectProduct, disableNavigation } = useStore();
    const { openCart, getTotalItems } = useCart();
    const router = useRouter();
    const params = useParams();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    
    if (!selectedStore) return null;

    const storeLanguage = selectedStore.language || 'en';
    
    // Header links with translations based on store language
    const headerLinks = [
        { label: getStoreTranslation("about", storeLanguage), href: "#about" },
        { label: getStoreTranslation("products", storeLanguage), href: "#products" },
        { label: getStoreTranslation("contact", storeLanguage), href: "#contact" },
    ];
    const primaryColor = selectedStore.theme?.primaryColor || '#22c55e';
    const cartItemsCount = getTotalItems();

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (disableNavigation) return;

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
            className="relative text-white overflow-visible"
        >
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 py-3 sm:py-4">
                    {/* Logo - Home & Garden Style with Organic Accent */}
                    <button
                        onClick={handleLogoClick}
                        className="group flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 hover:opacity-80 transition-opacity min-w-0 relative"
                    >
                        {selectedStore.logoUrl && (
                            <div className="relative h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12">
                                <Image
                                    src={selectedStore.logoUrl}
                                    alt={`${selectedStore.brandName} logo`}
                                    fill
                                    className="object-contain flex-shrink-0 rounded-full"
                                />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h1 
                                className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold truncate text-white"
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
                                href={disableNavigation ? '#' : link.href}
                                onClick={(e) => { if (disableNavigation) e.preventDefault(); }}
                                className="text-sm font-light text-white/90 hover:text-white hover:transition-colors duration-300 tracking-wide uppercase whitespace-nowrap"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Inline Search Bar - Desktop */}
                    <AnimatePresence>
                        {searchVisible && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 'auto', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="hidden lg:block overflow-hidden"
                            >
                                <div className="w-48 xl:w-64">
                                    <SearchBar 
                                        primaryColor="#ffffff" 
                                        isCompact={true}
                                        onProductSelect={(product) => {
                                            selectProduct(product);
                                            setSearchVisible(false);
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Cart and Mobile Menu Button */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Search Toggle Button */}
                        <button
                            onClick={() => setSearchVisible(!searchVisible)}
                            className="hidden lg:block p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                            aria-label="Toggle search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                        {/* Login Link */}
                        <a
                            href={disableNavigation ? '#' : `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${(params as any)?.locale || 'en'}/login`}
                            onClick={(e) => { if (disableNavigation) e.preventDefault(); }}
                            className="hidden md:flex items-center p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white"
                            aria-label="Login"
                        >
                            <User className="w-5 h-5 sm:w-6 sm:h-6" />
                        </a>
                        <button
                            onClick={openCart}
                            className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                            aria-label="View cart"
                        >
                            <ShoppingCartIcon 
                                className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                            />
                            {cartItemsCount > 0 && (
                                <span 
                                    className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs"
                                    style={{ color: primaryColor }}
                                >
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                </span>
                            )}
                        </button>
                        
                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6 text-white" />
                            ) : (
                                <Menu className="h-6 w-6 text-white" />
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
                            className="md:hidden overflow-hidden border-t border-white/20"
                        >
                            <div className="px-4 py-4 space-y-4">
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
                                            href={disableNavigation ? '#' : link.href}
                                            onClick={(e) => { if (disableNavigation) { e.preventDefault(); } else { setMobileMenuOpen(false); } }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="text-base font-semibold py-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white"
                                        >
                                            {link.label}
                                        </motion.a>
                                    ))}
                                    {/* Login Link */}
                                    <motion.a
                                        href={disableNavigation ? '#' : `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${(params as any)?.locale || 'en'}/login`}
                                        onClick={(e) => { if (disableNavigation) e.preventDefault(); else setMobileMenuOpen(false); }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: headerLinks.length * 0.1 }}
                                        className="flex items-center gap-2 text-base font-semibold py-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white"
                                    >
                                        <User className="w-5 h-5" />
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
