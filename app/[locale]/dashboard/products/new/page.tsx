
'use client'
import ProductForm from '@/components/dashboard/productForm';
import {useTranslations} from 'next-intl';

export default function NewProductPage() {
    const t = useTranslations('products');

    function handleSubmit() {
        alert("Done!")
    }

    return (
        <div className="grid gap-4">
        <h2 className="text-xl font-semibold">{t('createTitle')}</h2>
        <ProductForm onSubmit={handleSubmit} />
        </div>
    );
}
