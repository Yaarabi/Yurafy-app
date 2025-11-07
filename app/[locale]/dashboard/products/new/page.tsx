'use client';
import ProductForm from '@/components/dashboard/productForm';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
        toast.success(t('createSuccess')); 
        } catch (error: any) {
        console.error(error);
        toast.error(error.message || t('createError'));
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">{t('createTitle')}</h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
                    <ProductForm onSubmit={create} loading={loading} onReset={() => {}} />
                </div>
            </div>
        </div>
    );
}
