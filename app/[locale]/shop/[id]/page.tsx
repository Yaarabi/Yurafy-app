'use client';
import { useEffect, useState } from 'react';
import { IProduct } from '@/models/products';
import ProductGallery from '@/components/shop/productPage/ProductGallery';
import ProductDetails from '@/components/shop/productPage/ProductDetails';
import ProductVariantsUI from '@/components/shop/productPage/ProductVariantsUI';
import RelatedProducts from '@/components/shop/productPage/RelatedProducts';
import { useTranslations } from 'next-intl';
import OrderForm from '@/components/shop/productPage/orderForm';
import WhatsAppButton from '@/components/shop/productPage/ProductActions';
import ProductHeader from '@/components/shop/productPage/ProductHeader';
import Header from '@/components/shop/Header';

interface IOwner {
    _id: string;
    name: string;
    brandName?: string;
    logo?: string;
    email: string;
    phone?: string;
    plan: 'store' | 'insta bot' | 'whatsapp bot' | 'Pro' | 'free';
    role: 'user' | 'admin';
}

export default function ProductPage({ params }: { params: { id: string } }) {
    const t = useTranslations('product');
    const [product, setProduct] = useState<IProduct | null>(null);
    const [owner, setOwner] = useState<IOwner | null>(null);

    useEffect(() => {
        async function fetchProductAndOwner() {
        const res = await fetch(`/api/products?id=${params?.id}`);
        const data = await res.json();
        setProduct(data.product);

        if (data.product?.owner) {
            const ownerRes = await fetch(`/api/users?id=${data.product.owner}`);
            const ownerData = await ownerRes.json();
            setOwner(ownerData.user);
        }
        }
        fetchProductAndOwner();
    }, [params.id]);

    if (!product) {
        return (
        <p className="text-center text-gray-400 mt-10 animate-pulse">
            {t('loadingProduct')}
        </p>
        );
    }

    return (
        <>
        {(owner) ? <ProductHeader owner={owner} /> : <Header/>}
        <main className="relative min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-cyan-50 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-10 p-6 md:p-12">

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
                <WhatsAppButton productName={product.name} />
            </div>
            </div>

            <RelatedProducts />
        </div>
        </main>
        </>
    );
}
