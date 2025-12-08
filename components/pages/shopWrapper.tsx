"use client";

import React, { useMemo, useState } from "react";
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
import ThemeRenderer from "@/components/store/themes/ThemeRenderer";

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
                
                {/* Render theme-specific ShopPage using ThemeRenderer */}
                <ThemeRenderer themeId={themeId} currentPage="SHOP_PAGE" />
                
                <Cart />
                <WhatsAppButton ownerPhone={store.whatsappNumber || store.businessInfo?.phone} />
            </StoreProvider>
        </>
    );
};

export default ShopClientWrapper;

