'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { IProduct } from '@/models/products';   

export default function ProductPage({ params }: { params: { id: string } }) {
    const t = useTranslations('product');
    const [product, setProduct] = useState<IProduct | null>(null);
    // Mock product for demo
    useEffect(() => {
        async function fetchProduct() {
            const res = await fetch(`/api/products?id=${params.id}`);
            const data = await res.json();
            setProduct(data.product);
        }

        fetchProduct();
    }, [params.id]);
    if (!product) {
        return (
        <p className="text-center text-gray-400 mt-10 animate-pulse">
            {t('loadingProduct')}
        </p>
        );
    };

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-cyan-50 px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
            className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 md:p-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            {/* Product Image */}
            <div className="relative w-full md:w-1/2 h-96 rounded-2xl overflow-hidden shadow-md">
            <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-cover transition-transform hover:scale-105"
            />
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col justify-between">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{product.name}</h1>
                <p className="text-gray-600 mt-3 text-lg sm:text-xl">{product.description}</p>
                <p className="text-blue-600 text-2xl font-bold mt-6">{product.price} MAD</p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition shadow-md">
                {t('orderCOD')}
                </button>
                <p className="text-sm text-gray-500 mt-3 sm:mt-0">{t('codNote')}</p>
            </div>
            </div>
        </motion.div>

        {/* Related Products */}
        <motion.section
            className="max-w-7xl mx-auto mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
            {/* You can reuse your ProductGrid here with related products */}
            {/* <ProductGrid products={relatedProducts} /> */}
        </motion.section>
        </main>
    );
}
