'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IProduct } from '@/models/products';
import ProductGallery from '@/components/shop/productPage/ProductGallery';
import ProductDetails from '@/components/shop/productPage/ProductDetails';
import ProductVariants from '@/components/shop/productPage/ProductVariants';
import RelatedProducts from '@/components/shop/productPage/RelatedProducts';
import { useTranslations } from 'next-intl';
import OrderForm from '@/components/shop/productPage/orderForm';
import WhatsAppButton from '@/components/shop/productPage/ProductActions';

export default function ProductPage({ params }: { params: { id: string } }) {
    const t = useTranslations('product');
    const [product, setProduct] = useState<IProduct | null>(null);

    useEffect(() => {
        async function fetchProduct() {
        const res = await fetch(`/api/products?id=${params?.id}`);
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
    }

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-cyan-50 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div
            className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 p-6 md:p-12"
        >
            {/* Product Gallery */}
            <ProductGallery
            mainImage={product.mainImage}
            images={product.images}
            alt={product.name}
            />

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between">
                <ProductDetails product={product} />
                <ProductVariants variants={product.variants} />
                <OrderForm product={product} />

                {/* WhatsApp button pinned inside card */}
                <WhatsAppButton productName={product.name} />
            </div>
        </div>

        {/* Related Products */}
        <RelatedProducts />
        </main>
    );
}
