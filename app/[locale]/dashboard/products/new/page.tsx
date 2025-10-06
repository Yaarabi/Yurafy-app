'use client';
import ProductForm from '@/components/dashboard/productForm';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function NewProductPage() {
    const t = useTranslations('products');
    const [loading, setLoading] = useState(false);

    async function create(values: any) {
        console.log(values);
        setLoading(true);
        try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Something went wrong');
        }

        // Optional: clear the form or show a success message
        alert(t('createSuccess')); 
        } catch (error: any) {
        console.error(error);
        alert(error.message || t('createError'));
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">{t('createTitle')}</h2>
        <ProductForm onSubmit={create} loading={loading} />
        </div>
    );
}
