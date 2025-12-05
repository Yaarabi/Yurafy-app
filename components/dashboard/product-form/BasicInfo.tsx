'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/products';

interface BasicInfoProps {
    values: Partial<IProduct>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Partial<Record<keyof IProduct, string>>;
    Input: (props: any) => React.JSX.Element;
    Textarea: (props: any) => React.JSX.Element;
    PRODUCT_CATEGORIES: string[];
    loadingCategories?: boolean;
}

export default function BasicInfo({ values, handleChange, errors, Input, Textarea, PRODUCT_CATEGORIES, loadingCategories = false }: BasicInfoProps) {
    const t = useTranslations('products.form');

    return (
        <>
            {/* Name & Slug */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('name')} name="name" value={values.name || ''} onChange={handleChange} error={errors.name} />
                <Input label={t('slug')} name="slug" value={values.slug || ''} onChange={handleChange} error={errors.slug} />
            </div>

            <Textarea label={t('description')} name="description" value={values.description || ''} onChange={handleChange} />

            {/* Price, Discount, Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label={t('price')} name="price" type="number" step="0.01" value={values.price || ''} onChange={handleChange} error={errors.price} placeholder="0.00" />
                <Input label={t('discount')} name="discount" type="number" min="0" max="100" value={values.discount || ''} onChange={handleChange} placeholder="0" />
                <Input label={t('stock')} name="stock" type="number" min="0" value={values.stock || ''} onChange={handleChange} error={errors.stock} placeholder="0" />
            </div>

            {/* Brand & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('brand')} name="brand" value={values.brand || ''} onChange={handleChange} />
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('category')}</label>
                    <select
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        disabled={loadingCategories}
                        className={`px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border ${errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <option value="" disabled>
                            {loadingCategories ? 'Loading categories...' : t('selectCategory')}
                        </option>
                        {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <span className="text-red-500 text-sm">{errors.category}</span>}
                </div>
            </div>
        </>
    );
}
