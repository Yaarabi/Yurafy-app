"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SerializedStore } from "@/lib/data/products";
import { IProduct } from "@/models/products";
import SeoJsonLd from "@/components/common/SeoJsonLd";
import { StoreProvider } from "@/components/store/context/StoreContext";
import Cart from "@/components/store/components/Cart";
import WhatsAppButton from "@/components/productPage/ProductActions";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { getStoreTranslation } from "@/components/store/utils/translations";
import ThemeHeaderFooter from "@/components/store/themes/ThemeHeaderFooter";

interface ShopClientWrapperProps {
    store: SerializedStore;
    products: IProduct[];
    storeUrl?: string;
    selectedCategory?: string;
}

const ShopClientWrapper: React.FC<ShopClientWrapperProps> = ({ 
    store, 
    products, 
    storeUrl,
    selectedCategory 
}) => {
    const router = useRouter();
    const params = useParams();
    const [filterCategory, setFilterCategory] = useState<string>(selectedCategory || '');
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // Get unique categories from products
    const categories = useMemo(() => {
        const cats = products
            .map(p => p.category)
            .filter((cat, index, self) => cat && self.indexOf(cat) === index)
            .sort();
        return cats;
    }, [products]);

    // Filter products by category
    const filteredProducts = useMemo(() => {
        if (!filterCategory) return products;
        return products.filter(p => p.category === filterCategory);
    }, [products, filterCategory]);

    const onProductSelect = useCallback((product: IProduct) => {
        const domain = (params as any)?.domain || store.domain;
        const locale = (params as any)?.locale || 'en';
        const href = `/${locale}/${domain}/shop/${product.slug}`;
        
        try {
            router.push(href);
        } catch (err) {
            window.location.href = href;
        }
    }, [params, router, store.domain]);

    const handleCategoryChange = (category: string) => {
        setFilterCategory(category);
        const domain = (params as any)?.domain || store.domain;
        const locale = (params as any)?.locale || 'en';
        const url = category 
            ? `/${locale}/${domain}/shop?category=${encodeURIComponent(category)}`
            : `/${locale}/${domain}/shop`;
        router.push(url);
    };

    const primaryColor = store.theme?.primaryColor || '#3B82F6';
    const storeLanguage = store.language || 'en';

    // Calculate themeId
    const rawThemeId = (store as any)?.themeId ?? "1";
    const parsed = Number(rawThemeId);
    const themeId = Number.isFinite(parsed) && !Number.isNaN(parsed) ? parsed : 1;

    return (
        <>
            <SeoJsonLd store={store} storeUrl={storeUrl} />
            <StoreProvider stores={[store]} initialStore={store} products={filteredProducts}>
                {/* Render theme header */}
                <ThemeHeaderFooter themeId={themeId} section="header" />
                
                {/* Filter Area - Below Header */}
                <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-end gap-4">
                            {/* Desktop Filter */}
                            <div className="hidden md:flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    {getStoreTranslation("filterByCategory", storeLanguage) || "Filter by Category"}:
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base min-w-[200px] font-semibold"
                                    style={{ 
                                        borderColor: filterCategory ? primaryColor : '#d1d5db',
                                        color: filterCategory ? primaryColor : '#6b7280',
                                        '--tw-ring-color': primaryColor,
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
                                    value={filterCategory}
                                    onChange={(e) => {
                                        handleCategoryChange(e.target.value);
                                        setShowMobileFilter(false);
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 text-base font-semibold"
                                    style={{ 
                                        borderColor: filterCategory ? primaryColor : '#d1d5db',
                                        color: filterCategory ? primaryColor : '#6b7280',
                                        '--tw-ring-color': primaryColor,
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

                {/* Products Grid */}
                <div className="min-h-screen bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-lg text-gray-500 mb-4">
                                    {filterCategory 
                                        ? getStoreTranslation("noProductsInCategory", storeLanguage) || `No products found in "${filterCategory}" category.`
                                        : getStoreTranslation("noProducts", storeLanguage) || "No products available."
                                    }
                                </p>
                                {filterCategory && (
                                    <button
                                        onClick={() => handleCategoryChange('')}
                                        className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {getStoreTranslation("viewAllProducts", storeLanguage) || "View All Products"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onProductSelect(product)}
                                        className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                                    >
                                        <div className="relative overflow-hidden">
                                            <motion.img
                                                src={product.mainImage}
                                                alt={product.name}
                                                className="w-full h-56 object-cover"
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.5 }}
                                            />
                                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                            {(product.discount ?? 0) > 0 && (
                                                <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    -{product.discount}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                {product.category}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold" style={{ color: primaryColor }}>
                                                        ${(product.price * (1 - ((product.discount ?? 0) / 100))).toFixed(2)}
                                                    </span>
                                                    {(product.discount ?? 0) > 0 && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            ${product.price.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Render theme footer */}
                <ThemeHeaderFooter themeId={themeId} section="footer" />
                
                <Cart />
                <WhatsAppButton ownerPhone={store.whatsappNumber || store.businessInfo?.phone} />
            </StoreProvider>
        </>
    );
};

export default ShopClientWrapper;

