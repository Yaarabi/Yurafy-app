'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/products';

interface ProductFormProps {
    onSubmit?: (values: Partial<IProduct>) => void;
    loading?: boolean;
}

export default function ProductForm({ onSubmit, loading }: ProductFormProps) {
    const t = useTranslations('products.form');

    const [values, setValues] = useState<Partial<IProduct>>({
            name: '',
            slug: '',
            description: '',
            price: 0,
            discount: 0,
            stock: 0,
            category: '',
            brand: '',
            images: [''],
            variants: [],
        });

        const [errors, setErrors] = useState<Partial<Record<keyof IProduct, string>>>({});

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
            const { name, value, type } = e.target;
            setValues((prev) => ({
            ...prev,
            [name]:
                type === 'number'
                ? Number(value)
                : name === 'images'
                ? value.split(',').map((i) => i.trim())
                : value,
            }));
        }

    function validate(): boolean {
        const newErrors: Partial<Record<keyof IProduct, string>> = {};
        if (!values.name?.trim()) newErrors.name = t('errors.nameRequired');
        if (!values.slug?.trim()) newErrors.slug = t('errors.slugRequired');
        if (!values.price || values.price < 0) newErrors.price = t('errors.pricePositive');
        if (!values.stock || values.stock < 0) newErrors.stock = t('errors.stockNonNegative');
        if (!values.category) newErrors.category = t('errors.categoryRequired');
        if (!values.images || values.images.length === 0) newErrors.images = t('errors.imagesRequired');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        onSubmit?.(values);
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg flex flex-col gap-5">
        <Input label={t('name')} name="name" value={values.name || ''} onChange={handleChange} error={errors.name} />
        <Input label={t('slug')} name="slug" value={values.slug || ''} onChange={handleChange} error={errors.slug} />
        <Textarea label={t('description')} name="description" value={values.description || ''} onChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('price')} name="price" type="number" value={values.price || 0} onChange={handleChange} error={errors.price} />
            <Input label={t('discount')} name="discount" type="number" value={values.discount || 0} onChange={handleChange} />
            <Input label={t('stock')} name="stock" type="number" value={values.stock || 0} onChange={handleChange} error={errors.stock} />
            <Input label={t('category')} name="category" value={values.category || ''} onChange={handleChange} error={errors.category} />
        </div>
        <Input label={t('brand')} name="brand" value={values.brand || ''} onChange={handleChange} />
        <Input
            label={t('images')}
            name="images"
            value={values.images?.join(',') || ''}
            onChange={handleChange}
            placeholder="Enter comma-separated URLs"
            error={errors.images}
        />

        <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-md'
            }`}
        >
            {loading ? t('creating') : t('create')}
        </button>
        </form>
    );
    }

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

function Input({ label, error, ...props }: InputProps) {
    return (
        <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <input
            className={`px-4 py-2 rounded-lg bg-gray-800 border ${
            error ? 'border-red-500' : 'border-gray-700'
            } text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
            {...props}
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}
        </label>
    );
    }

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

function Textarea({ label, ...props }: TextareaProps) {
    return (
        <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <textarea
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            rows={4}
            {...props}
        />
        </label>
    );
}
