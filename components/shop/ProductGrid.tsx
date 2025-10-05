
'use client';

import ProductCard from './ProductCard';
import { useTranslations } from 'next-intl';

interface Product {
        _id: string;
        name: string;
        price: number;
        category: string;
        images: string;
        description: string;
        stock: number;
}

export default function ProductGrid({ products }: { products: Product[] }) {
    const t = useTranslations('shop');

    if (!products?.length)
        return (
        <p className="text-center text-gray-500 mt-10">{t('noProducts')}</p>
        );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {products.map((p, i) => (
            <ProductCard key={i} product={p} />
        ))}
        </div>
    );
}
