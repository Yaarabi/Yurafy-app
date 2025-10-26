"use client";

import React, { useState } from "react";
import { SerializedStore } from "@/lib/data/products";
import Link from "next/link";

interface HeaderProps {
    store: SerializedStore;
    onBack?: () => void;
    page: "store" | "collection" | "product";
}

const MobileMenu: React.FC<{
    onClose: () => void;
    }> = ({ onClose }) => {
    return (
        <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in"
        style={{
            backgroundColor: "var(--secondary-color)",
            color: "var(--text-color)",
        }}
        >
        {/* Close Button */}
        <button
            onClick={onClose}
            className="absolute top-5 right-5"
            aria-label="Close menu"
        >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
            </svg>
        </button>

        {/* Mobile Nav */}
        <nav className="flex flex-col items-center gap-8 text-2xl">
            <Link
            href="#"
            className="hover:opacity-80 font-semibold transition-opacity"
            >
            Home
            </Link>

            <Link
            href="#"
            className="hover:opacity-80 font-semibold transition-opacity"
            >
            Products
            </Link>

            <Link
            href="#"
            className="hover:opacity-80 font-semibold transition-opacity"
            >
            About
            </Link>
        </nav>

        <style>{`
            @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
            }
            .animate-fade-in {
            animation: fade-in 0.2s ease-out;
            }
        `}</style>
        </div>
    );
    };

    const Header: React.FC<HeaderProps> = ({
    store,
    onBack,
    page,
    }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
        <header
            className="shadow-md sticky top-0 z-40"
            style={{
            backgroundColor: "var(--secondary-color)",
            color: "var(--text-color)",
            }}
        >
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            {/* Brand */}
            <button
                className="flex items-center gap-3 cursor-pointer z-50"
            >
                {store.logoUrl && (
                <img
                    src={store.logoUrl}
                    alt={`${store.brandName} Logo`}
                    className="h-10 w-10 rounded-full object-cover"
                />
                )}
                <span className="text-xl font-bold tracking-wider">
                {store.brandName}
                </span>
            </button>

            <div className="flex items-center">
                {/* Back button on product page */}
                {page === "product" && onBack ? (
                <button
                    onClick={onBack}
                    className="text-sm font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity"
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
                    {/* ✅ Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                    <Link
                        href="#"
                        className="hover:opacity-80 transition-opacity"
                    >
                        Home
                    </Link>
                    <Link
                        href="#"
                        className="hover:opacity-80 transition-opacity"
                    >
                        Products
                    </Link>
                    <Link
                        href="#about-us"
                        className="hover:opacity-80 transition-opacity"
                    >
                        About
                    </Link>
                    </nav>

                    {/* ✅ Mobile Menu Button */}
                    <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden"
                    aria-label="Open menu"
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                    </button>
                </>
                )}
            </div>
            </div>
        </header>

        {/* ✅ Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <MobileMenu
            onClose={() => setIsMobileMenuOpen(false)}
            />
        )}
        </>
    );
};

export default Header;
