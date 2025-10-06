'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/products';

export default function ProductGrid() {
    const t = useTranslations('shop');
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch products when the component mounts
        async function fetchProducts() {
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to fetch products');

            const data = await res.json();
            setProducts(data.products || []); // Safely handle missing data
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
        }

        fetchProducts();
    }, []);

    // Loading state — gives visual feedback while waiting for data
    if (loading)
        return (
        <p className="text-center text-gray-400 mt-10 animate-pulse">
            {t('loadingProducts')}
        </p>
        );

    // Empty state — appears when no products are found
    if (!products.length)
        return (
        <p className="text-center text-gray-500 mt-10">
            {t('noProducts')}
        </p>
        );

  // Render the product grid
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {products.map((p, i) => (
            <ProductCard key={i} product={p} />
        ))}
        </div>
    );
}
