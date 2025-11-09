"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useStore } from "../hooks/useStore";
import { IProduct } from "@/models/products";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

interface SearchBarProps {
    primaryColor?: string;
    onProductSelect?: (product: IProduct) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ primaryColor = '#0891b2', onProductSelect }) => {
    const { selectedStore } = useStore();
    const router = useRouter();
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<IProduct[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search function
    const searchProducts = useCallback(async (query: string) => {
        if (!query.trim() || !selectedStore?.owner) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        try {
            const response = await fetch(
                `/api/products?owner=${selectedStore.owner}&search=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error("Search failed");
            }

            const data = await response.json();
            setSearchResults(data.products || []);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [selectedStore?.owner]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchProducts(searchQuery);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, searchProducts]);

    const handleProductClick = (product: IProduct) => {
        // Call the onProductSelect callback if provided
        if (onProductSelect) {
            onProductSelect(product);
        }

        // Navigate to product page - nested routing: /{locale}/{domain}/shop/{slug}
        const domain = (params as any)?.domain || selectedStore?.domain || "";
        const locale = (params as any)?.locale || 'en';
        if (domain && product.slug) {
            const href = `/${locale}/${domain}/shop/${product.slug}`;
            try {
                router.push(href);
            } catch (err) {
                // Fallback to window.location
                window.location.href = href;
            }
        }

        setSearchQuery("");
        setShowResults(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setShowResults(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        if (searchResults.length > 0 || searchQuery) {
                            setShowResults(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-2 pl-10 pr-10 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
                    style={{
                        borderColor: searchQuery ? primaryColor : undefined,
                        outlineColor: primaryColor,
                    }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isSearching ? (
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            setShowResults(false);
                            inputRef.current?.focus();
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {showResults && (searchResults.length > 0 || isSearching) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
                    >
                        {isSearching && searchResults.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin h-6 w-6 mx-auto mb-2" style={{ color: primaryColor }}>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                Searching...
                            </div>
                        ) : searchResults.length === 0 && searchQuery ? (
                            <div className="p-4 text-center text-gray-500">
                                No products found for "{searchQuery}"
                            </div>
                        ) : (
                            <div className="py-2">
                                {searchResults.map((product) => (
                                    <motion.button
                                        key={product._id}
                                        onClick={() => handleProductClick(product)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                        whileHover={{ backgroundColor: `${primaryColor}10` }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {product.mainImage && (
                                                <img
                                                    src={product.mainImage}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {product.name}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {product.discount && product.discount > 0 ? (
                                                        <>
                                                            <span className="text-sm font-bold" style={{ color: primaryColor }}>
                                                                ${((product.price * (100 - product.discount)) / 100).toFixed(2)}
                                                            </span>
                                                            <span className="text-xs text-gray-500 line-through">
                                                                ${product.price.toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm font-bold" style={{ color: primaryColor }}>
                                                            ${product.price.toFixed(2)}
                                                        </span>
                                                    )}
                                                    {product.stock === 0 && (
                                                        <span className="text-xs text-red-500">Out of stock</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;

