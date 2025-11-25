"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";

interface VariableDropdownProps {
    onSelect: (variable: string) => void;
}

// Map of display names to actual template variables
const VARIABLES = [
    { label: "Customer Name", value: "fullName" },
    { label: "Customer Email", value: "email" },
    { label: "Customer Phone", value: "phone" },
    { label: "Customer Address", value: "address" },
    { label: "Customer City", value: "city" },
    { label: "Customer Country", value: "country" },
    { label: "Total Amount", value: "totalAmount" },
    { label: "Order Status", value: "status" },
    { label: "Product Name", value: "productName" },
    { label: "Product Quantity", value: "productQuantity" },
    { label: "Product Price", value: "productPrice" },
    { label: "Product Color", value: "productColor" },
    { label: "Product Size", value: "productSize" },
    { label: "Delivery Instructions", value: "deliveryInstructions" },
    { label: "Preferred Time", value: "preferredTime" },
];

export default function VariableDropdown({ onSelect }: VariableDropdownProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
        {/* Icon button */}
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-10 h-10 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 rounded transition text-white"
            title="Add Variable"
        >
            <FaPlus />
        </button>

        {/* Dropdown */}
        {open && (
            <div className="absolute z-10 mt-2 w-56 bg-white dark:bg-gray-800 rounded shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {VARIABLES.map((v) => (
                    <button
                        key={v.value}
                        type="button"
                        onClick={() => {
                            onSelect(v.value);
                            setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-[var(--brand-blue)]/10 hover:text-[var(--brand-blue)]"
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        )}
        </div>
    );
}
