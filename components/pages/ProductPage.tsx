"use client";

import React, { useState, useRef, useEffect } from "react";
import { IProduct } from "@/models/store/products";
import { SerializedStore } from "@/lib/data/products";
import WhatsAppButton from "../productPage/ProductActions";
import ThemeRenderer from "../store/themes/ThemeRenderer";
import { useStore } from "@/components/store/hooks/useStore";
import { useCart } from "@/components/store/context/CartContext";


interface ProductPageProps {
    product: IProduct;
    store: SerializedStore;
}

const ProductCompo: React.FC<ProductPageProps> = ({ product, store }) => {
    const { selectProduct } = useStore();
    const { openCart } = useCart();
    const [showOrderForm, setShowOrderForm] = useState(false);
    const formRef = useRef<HTMLDivElement | null>(null);

    // Set the product in context when component mounts
    useEffect(() => {
        if (product) {
            selectProduct(product);
        }
    }, [product, selectProduct]);

    // Resolve themeId which is serialized as string in the store model
    const rawThemeId = store?.themeId ?? "1";
    const parsedThemeId = Number(rawThemeId);
    const themeId = Number.isFinite(parsedThemeId) && !Number.isNaN(parsedThemeId) ? parsedThemeId : 1;
    
    // Automatically scroll to the form when shown
    useEffect(() => {
        if (showOrderForm && formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [showOrderForm]);

    return (
        <div className="min-h-screen flex flex-col bg-white">

            <ThemeRenderer themeId={themeId} currentPage="PRODUCT_PAGE" />

        <WhatsAppButton ownerPhone={store.whatsappNumber || store.businessInfo?.phone} />

        {/* Mobile Order Now Button */}
        <button
            onClick={() => {
                const orderForm = document.getElementById('order-form');
                if (orderForm) {
                    orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-50 px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 mx-auto max-w-[calc(100%-8rem)]"
            style={{
                backgroundColor: "var(--primary-color)",
            }}
        >
            Order Now!
        </button>
        </div>
    );
};

export default ProductCompo;
