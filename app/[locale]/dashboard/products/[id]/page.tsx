
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/dashboard/productForm';
import { IProduct } from '@/models/products';
import LogoLoader from '@/components/themePreview/loadder';

export default function EditProductPage() {
    const t = useTranslations('products');
    const { id } = useParams(); 
    const [product, setProduct] = useState<Partial<IProduct> | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Fetch product data
    useEffect(() => {
        if (!id) return;
        async function fetchProduct() {
        try {
            const res = await fetch(`/api/products?id=${id}`);
            if (!res.ok) throw new Error('Failed to fetch product');
            const data = await res.json();
            setProduct(data.product);
        } catch (err) {
            console.error(err);
            alert(t('fetchError'));
        } finally {
            setFetching(false);
        }
        }
        fetchProduct();
    }, [id]);

    // Handle update
    async function update(values: Partial<IProduct>) {
        setLoading(true);
        try {
        const res = await fetch(`/api/products?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Something went wrong');
        }
        console.log(values);
        alert(t('updateSuccess'));
        } catch (error: any) {
        console.error(error);
        alert(error.message || t('updateError'));
        } finally {
        setLoading(false);
        }
    }

    if (fetching) {
        return <LogoLoader />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6 rounded-lg">
        <div>
            <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('editTitle')}</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            {product && (
                <ProductForm
                onSubmit={update}
                loading={loading}
                initialValues={product}
                />
            )}
            </div>
        </div>
        </div>
    );
}
