'use client';
import ProductForm from '@/components/dashboard/productForm';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function NewProductPage() {
    const t = useTranslations('products');
    const [loading, setLoading] = useState(false);

    async function create(values: any) {
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

        // Clear the form after successful creation
        if ((window as any).__productFormReset) {
            (window as any).__productFormReset();
        }
        
        // Show success message
        alert(t('createSuccess')); 
        } catch (error: any) {
        console.error(error);
        alert(error.message || t('createError'));
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6 rounded-lg">
        <div>
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('createTitle')}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <ProductForm onSubmit={create} loading={loading} onReset={() => {}} />
            </div>
        </div>
        </div>
    );
}
