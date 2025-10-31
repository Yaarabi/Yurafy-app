"use client";

import React, { useState, useEffect } from "react";
import { SerializedStore } from "@/lib/data/products";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X } from "lucide-react";

interface HeaderProps {
    store: SerializedStore;
    onBack?: () => void;
    page: "store" | "collection" | "product";
}

const MobileMenu: React.FC<{
    onClose: () => void;
    store: SerializedStore;
    params: any;
}> = ({ onClose, store, params }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-0 z-50 flex flex-col items-stretch bg-white dark:bg-gray-900"
                style={{
                    backgroundColor: "var(--background-color)",
                    color: "var(--text-color)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
                    <div className="flex items-center gap-3">
                        {store.logoUrl && (
                            <img
                                src={store.logoUrl}
                                alt={`${store.brandName} Logo`}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        )}
                        <span className="text-lg font-semibold">{store.brandName}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        style={{ color: "var(--text-color)" }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6">
                    <ul className="space-y-4">
                        <li>
                            <Link
                                href={`/${params.locale}/${params.domain}/`}
                                className="flex items-center text-lg font-medium hover:opacity-70 transition-opacity"
                                onClick={onClose}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${params.locale}/${params.domain}/shop`}
                                className="flex items-center text-lg font-medium hover:opacity-70 transition-opacity"
                                onClick={onClose}
                            >
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${params.locale}/${params.domain}/#about-us`}
                                className="flex items-center text-lg font-medium hover:opacity-70 transition-opacity"
                                onClick={onClose}
                            >
                                About
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <div className="flex items-center justify-between">
                        <Search size={20} />
                        <ShoppingBag size={20} />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

    const Header: React.FC<HeaderProps> = ({ store, onBack, page }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const params = useParams();

    return (
        <>
            <header
                className="sticky top-0 z-40 w-full backdrop-blur-sm border-b"
                style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-color)"
                }}
            >
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        {/* Logo/Brand Name */}
                        <Link
                            href={`/${params.locale}/${params.domain}/`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            {store.logoUrl && (
                                <motion.img
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    src={store.logoUrl}
                                    alt={`${store.brandName} Logo`}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            )}
                            <motion.span
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="text-lg font-semibold"
                            >
                                {store.brandName}
                            </motion.span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {/* Back button on product page */}
                            {page === "product" && onBack ? (
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Back to Collection
                                </button>
                            ) : (
                                <>
                                    {/* Desktop Navigation */}
                                    <nav className="hidden md:flex items-center space-x-8">
                                        <Link
                                            href={`/${params.locale}/${params.domain}/`}
                                            className="text-sm font-medium hover:opacity-70 transition-opacity"
                                        >
                                            Home
                                        </Link>
                                        <Link
                                            href={`/${params.locale}/${params.domain}/shop`}
                                            className="text-sm font-medium hover:opacity-70 transition-opacity"
                                        >
                                            Products
                                        </Link>
                                        <Link
                                            href={`/${params.locale}/${params.domain}/#about-us`}
                                            className="text-sm font-medium hover:opacity-70 transition-opacity"
                                        >
                                            About
                                        </Link>
                                    </nav>

                                    <div className="flex items-center gap-4 md:border-l md:pl-4" style={{ borderColor: "var(--border-color)" }}>
                                        <button
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                            aria-label="Search"
                                        >
                                            <Search size={20} />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                            aria-label="Shopping cart"
                                        >
                                            <ShoppingBag size={20} />
                                        </button>
                                    </div>

                                    {/* Mobile Menu Button */}
                                    <button
                                        onClick={() => setIsMobileMenuOpen(true)}
                                        className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                        aria-label="Open menu"
                                    >
                                        <Menu size={24} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <MobileMenu
                    store={store}
                    params={params}
                    onClose={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default Header;
