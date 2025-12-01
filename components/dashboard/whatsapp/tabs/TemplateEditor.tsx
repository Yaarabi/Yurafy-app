"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";

interface VariableDropdownProps {
    onSelect: (variable: string) => void;
}

// Map of display names to actual template variables - organized by category
const VARIABLES = [
    // Customer Information
    { label: "👤 Customer Name", value: "fullName", category: "customer" },
    { label: "📧 Customer Email", value: "email", category: "customer" },
    { label: "📞 Customer Phone", value: "phone", category: "customer" },
    { label: "📍 Customer Address", value: "address", category: "customer" },
    { label: "🏙️ Customer City", value: "city", category: "customer" },
    { label: "🌍 Customer Country", value: "country", category: "customer" },
    
    // Order Information
    { label: "💰 Total Amount", value: "totalAmount", category: "order" },
    { label: "📊 Order Status", value: "status", category: "order" },
    { label: "📝 Delivery Instructions", value: "deliveryInstructions", category: "order" },
    { label: "🕒 Preferred Time", value: "preferredTime", category: "order" },
    { label: "🚚 Delivery Company", value: "deliveryCompany", category: "order" },
    
    // Product Information (for first product in order)
    { label: "📦 Product Name", value: "productName", category: "product" },
    { label: "🔢 Product Quantity", value: "productQuantity", category: "product" },
    { label: "💵 Product Price", value: "productPrice", category: "product" },
    { label: "🎨 Product Color", value: "productColor", category: "product" },
    { label: "📏 Product Size", value: "productSize", category: "product" },
    
    // Product List (all products formatted)
    { label: "📋 All Products List", value: "productsList", category: "product" },
    { label: "🛍️ Total Items Count", value: "totalItems", category: "product" },
];

export default function VariableDropdown({ onSelect }: VariableDropdownProps) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);

    useEffect(() => {
        if (open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const left = rect.left;
            const top = rect.bottom + 8; // 8px gap
            setCoords({ left, top });
        }
    }, [open]);

    return (
        <div className="relative">
        {/* Icon button */}
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-10 h-10 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 rounded transition text-white"
            title="Add Variable"
            ref={btnRef}
        >
            <FaPlus />
        </button>

        {/* Dropdown */}
        {open && (
            <div
                className="absolute right-0 top-full mt-2 z-[99999] w-64 sm:w-72 max-w-[92vw] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl ring-1 ring-black/10 dark:ring-white/10 border border-gray-200/70 dark:border-gray-700/60 max-h-64 overflow-y-auto overscroll-contain"
            >
                {/* Customer Section */}
                <div className="bg-gray-100 dark:bg-gray-700/80 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 sticky top-0 backdrop-blur-sm">
                    Customer Info
                </div>
                {VARIABLES.filter(v => v.category === 'customer').map((v) => (
                    <button
                        key={v.value}
                        type="button"
                        onClick={() => {
                            onSelect(v.value);
                            setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[var(--brand-blue)] transition"
                    >
                        {v.label}
                    </button>
                ))}
                
                {/* Order Section */}
                <div className="bg-gray-100 dark:bg-gray-700/80 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 sticky top-0 backdrop-blur-sm">
                    Order Details
                </div>
                {VARIABLES.filter(v => v.category === 'order').map((v) => (
                    <button
                        key={v.value}
                        type="button"
                        onClick={() => {
                            onSelect(v.value);
                            setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[var(--brand-blue)] transition"
                    >
                        {v.label}
                    </button>
                ))}
                
                {/* Product Section */}
                <div className="bg-gray-100 dark:bg-gray-700/80 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 sticky top-0 backdrop-blur-sm">
                    Product Info
                </div>
                {VARIABLES.filter(v => v.category === 'product').map((v) => (
                    <button
                        key={v.value}
                        type="button"
                        onClick={() => {
                            onSelect(v.value);
                            setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[var(--brand-blue)] transition"
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        )}
        </div>
    );
}
