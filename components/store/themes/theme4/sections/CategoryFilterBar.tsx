import React, { useState } from "react";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { getStoreTranslation } from "../../../utils/translations";

interface CategoryFilterBarProps {
    categories: string[];
    selectedCategory: string;
    onChange: (category: string) => void;
    primaryColor: string;
    storeLanguage: string;
}

const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
    categories,
    selectedCategory,
    onChange,
    primaryColor,
    storeLanguage,
}) => {
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    if (!categories.length) return null;

    return (
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-end gap-4">
                    {/* Desktop Filter */}
                    <div className="hidden md:flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            {getStoreTranslation("filterByCategory", storeLanguage) || "Filter by Category"}:
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => onChange(e.target.value)}
                            className="px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base min-w-[200px] font-semibold"
                            style={{
                                borderColor: selectedCategory ? primaryColor : "#d1d5db",
                                color: selectedCategory ? primaryColor : "#6b7280",
                                "--tw-ring-color": primaryColor,
                            } as React.CSSProperties}
                        >
                            <option value="">{getStoreTranslation("allCategories", storeLanguage) || "All Categories"}</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        style={{ borderColor: primaryColor }}
                    >
                        <Filter className="w-5 h-5" style={{ color: primaryColor }} />
                        <span className="text-sm font-medium">{getStoreTranslation("filter", storeLanguage) || "Filter"}</span>
                    </button>
                </div>

                {/* Mobile Filter Dropdown */}
                {showMobileFilter && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden mt-4 pb-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                                {getStoreTranslation("category", storeLanguage) || "Category"}:
                            </label>
                            <button
                                onClick={() => setShowMobileFilter(false)}
                                className="p-1 rounded hover:bg-gray-100"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                onChange(e.target.value);
                                setShowMobileFilter(false);
                            }}
                            className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 text-base font-semibold"
                            style={{
                                borderColor: selectedCategory ? primaryColor : "#d1d5db",
                                color: selectedCategory ? primaryColor : "#6b7280",
                                "--tw-ring-color": primaryColor,
                            } as React.CSSProperties}
                        >
                            <option value="">{getStoreTranslation("allCategories", storeLanguage) || "All Categories"}</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CategoryFilterBar;
