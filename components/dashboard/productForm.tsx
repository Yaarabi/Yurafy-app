'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/products';
import { useSession } from 'next-auth/react';
import ProductVariants from './product/ProductVariant';

interface ProductFormProps {
    onSubmit?: (values: Partial<IProduct>) => void;
    loading?: boolean;
    initialValues?: Partial<IProduct>;
}

export default function ProductForm({ onSubmit, loading, initialValues }: ProductFormProps) {
    const t = useTranslations('products.form');
    const { data: session } = useSession();

    const PRODUCT_CATEGORIES = [
        'Fashion & Apparel',
        'Beauty & Personal Care',
        'Electronics & Gadgets',
        'Home & Living',
        'Appliances',
        'Food & Beverages',
        'Health & Wellness',
        'Sports & Outdoors',
        'Toys, Kids & Baby',
        'Books, Art & Stationery',
        'Automotive',
        'Digital Products & Services',
        'Handmade & Local Creations',
        'Pet Supplies',
        'Office & Business',
    ];

    const [values, setValues] = useState<Partial<IProduct>>({
        owner: session?.user?.id,
        name: '',
        slug: '',
        description: '',
        price: 0,
        discount: 0,
        stock: 0,
        category: '',
        brand: '',
        mainImage: '',
        images: [],
        sizes: [],
        colors: [],
        ...initialValues,
    });

    const [showVariants, setShowVariants] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof IProduct, string>>>({});

    useEffect(() => {
        if (session?.user?.id) {
        setValues((prev) => ({ ...prev, owner: session.user.id as string }));
        }
    }, [session]);

    /** Upload images to server and store URLs */
    const handleImageUpload = async (
        e: ChangeEvent<HTMLInputElement>,
        field: 'mainImage' | 'images'
    ) => {
        const files = e.target.files;
        if (!files) return;

        const uploadedUrls: string[] = [];

        for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
            uploadedUrls.push(data.url);
        } else {
            console.error('Upload failed:', data.message);
        }
        }

        setValues((prev) => ({
        ...prev,
        [field]:
            field === 'mainImage'
            ? uploadedUrls[0]
            : [...(prev.images || []), ...uploadedUrls],
        }));
    };

    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value, type } = e.target;
        setValues((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
        }));
    }

    function validate(): boolean {
        const newErrors: Partial<Record<keyof IProduct, string>> = {};
        if (!values.name?.trim()) newErrors.name = t('errors.nameRequired');
        if (!values.slug?.trim()) newErrors.slug = t('errors.slugRequired');
        if (!values.price || values.price < 0) newErrors.price = t('errors.pricePositive');
        if (!values.stock || values.stock < 0) newErrors.stock = t('errors.stockNonNegative');
        if (!values.category) newErrors.category = t('errors.categoryRequired');
        if (!values.mainImage) newErrors.mainImage = t('errors.mainImageRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        onSubmit?.(values);
    }

    return (
        <form
        onSubmit={handleSubmit}
        className="w-full p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col gap-6 border border-gray-200 dark:border-gray-700"
        >
        {/* Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('name')} name="name" value={values.name || ''} onChange={handleChange} error={errors.name} />
            <Input label={t('slug')} name="slug" value={values.slug || ''} onChange={handleChange} error={errors.slug} />
        </div>

        <Textarea label={t('description')} name="description" value={values.description || ''} onChange={handleChange} />

        {/* Price, Discount, Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label={t('price')} name="price" type="number" value={values.price || 0} onChange={handleChange} error={errors.price} />
            <Input label={t('discount')} name="discount" type="number" value={values.discount || 0} onChange={handleChange} />
            <Input label={t('stock')} name="stock" type="number" value={values.stock || 0} onChange={handleChange} error={errors.stock} />
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
                className={`px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border ${errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue transition`}
            >
                <option value="" disabled>{t('selectCategory')}</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            {errors.category && <span className="text-red-500 text-sm">{errors.category}</span>}
            </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('mainImage')}</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'mainImage')}
                className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:opacity-90 cursor-pointer text-gray-800 dark:text-gray-200"
            />
            {values.mainImage && (
                <img src={values.mainImage} alt="Main Preview" className="mt-2 w-full h-60 object-cover rounded-lg border border-gray-700" />
            )}
            </div>

            {/* Additional Images */}
            <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('otherImages')}</label>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'images')}
                className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:opacity-90 cursor-pointer text-gray-800 dark:text-gray-200"
            />
            <div className="flex flex-wrap gap-3 mt-2">
                {values.images?.map((img, idx) => (
                <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="w-28 h-28 object-cover rounded-lg border border-gray-700" />
                ))}
            </div>
            </div>
        </div>

        {/* Sizes & Colors */}
        <div className="mt-4">
            <button
            type="button"
            onClick={() => setShowVariants((prev) => !prev)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium"
            >
            {showVariants ? 'Hide Sizes & Colors' : 'Manage Sizes & Colors'}
            </button>

            {showVariants && (
            <div className="mt-4">
                <ProductVariants
                sizes={values.sizes || []}
                colors={values.colors || []}
                onChange={({ sizes, colors }) =>
                    setValues((prev) => ({ ...prev, sizes, colors }))
                }
                />
            </div>
            )}
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${loading ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-brand-blue hover:opacity-90 shadow-md'}`}
        >
            {loading
            ? initialValues
                ? t('updating')
                : t('creating')
            : initialValues
            ? t('update')
            : t('create')}
        </button>
        </form>
    );
}



    /* Reusable Input */
    interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    }

    function Input({ label, error, ...props }: InputProps) {
    return (
        <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{label}</span>
        <input
            className={`px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue transition`}
            {...props}
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}
        </label>
    );
    }

    /* Reusable Textarea */
    interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    }

    function Textarea({ label, ...props }: TextareaProps) {
    return (
        <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{label}</span>
        <textarea
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue transition resize-none"
            rows={4}
            {...props}
        />
        </label>
    );
    }
