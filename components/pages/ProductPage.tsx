"use client";

import React, { useState, useRef, useEffect } from "react";
import { IProduct } from "@/models/products";
import { SerializedStore } from "@/lib/data/products";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TrustSection from "./components/TrustSection";
import OrderForm from "../productPage/orderForm";
import ProductGallery from "../productPage/ProductGallery";
import ProductVariantsUI from "../productPage/ProductVariantsUI";
import ProductDetails from "../productPage/ProductDetails";

interface ProductPageProps {
    product: IProduct;
    store: SerializedStore;
}

const ProductCompo: React.FC<ProductPageProps> = ({ product, store }) => {
    const [showOrderForm, setShowOrderForm] = useState(false);
    const formRef = useRef<HTMLDivElement | null>(null);

    // Automatically scroll to the form when shown
    useEffect(() => {
        if (showOrderForm && formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [showOrderForm]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
        {/* Header */}
        <Header store={store} page="product" />

        {/* Main Content */}
            <main className="relative min-h-screen px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <section className="max-w-6xl mx-auto flex flex-col gap-10 p-6 md:p-12 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm">
                    <div className="flex flex-col md:flex-row gap-10">
                        <ProductGallery
                            mainImage={product.mainImage}
                            images={product.images}
                            alt={product.name}
                        />

                        <div className="flex-1 flex flex-col justify-between">
                            <ProductDetails product={product} />
                            <ProductVariantsUI sizes={product.sizes} colors={product.colors} />
                            <OrderForm product={product} />
                        </div>
                    </div>
                </section>
            </main>

        {/* Trust section */}
        <TrustSection />

        {/* Footer */}
        <Footer store={store} />

        {/* Floating Button (Mobile Only) */}
        <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
            style={{
            backgroundColor: "var(--primary-color)",
            }}
        >
            {showOrderForm ? "Fermer le formulaire" : "🛒 Commander maintenant"}
        </button>
        </div>
    );
};

export default ProductCompo;
