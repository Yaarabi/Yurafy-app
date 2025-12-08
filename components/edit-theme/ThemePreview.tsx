"use client";

import { useEffect } from "react";
import ThemeInjector from "@/components/productPage/ThemeInjector";
import { StoreProvider } from "@/components/store/context/StoreContext";
import ThemeRenderer from "@/components/store/themes/ThemeRenderer";
import type { SerializedStore } from "@/lib/data/store";
import type { IProduct } from "@/models/products";

interface ThemePreviewProps {
    previewStore: SerializedStore | null;
    products: IProduct[];
    previewPage: "STORE_PAGE" | "PRODUCT_PAGE";
    scale: number;
}

const ProductPreviewInitializer = ({ active }: { active: boolean }) => {
    const { products, selectedProduct, selectProduct } = useStore();
    useEffect(() => {
        if (active && !selectedProduct && products && products.length > 0) {
            selectProduct(products[0]);
        }
    }, [active, selectedProduct, products, selectProduct]);
    return null;
};

// Import useStore hook
import { useStore } from "@/components/store/hooks/useStore";

export default function ThemePreview({
    previewStore,
    products,
    previewPage,
    scale,
}: ThemePreviewProps) {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner">
            {previewStore ? (
                <div>
                    <ThemeInjector theme={previewStore.theme} />
                    <StoreProvider stores={[previewStore]} initialStore={previewStore} products={products} disableNavigation>
                        <ProductPreviewInitializer active={previewPage === "PRODUCT_PAGE"} />
                        <div
                            className="origin-top-left"
                            style={scale < 1 ? { transform: `scale(${scale})`, width: `${100 / scale}%` } : {}}
                        >
                            <ThemeRenderer themeId={previewStore.themeId || 1} currentPage={previewPage} />
                        </div>
                    </StoreProvider>
                </div>
            ) : (
                <div className="flex items-center justify-center h-96 text-sm text-gray-500 dark:text-gray-400">
                    No store data available for preview
                </div>
            )}
        </div>
    );
}
