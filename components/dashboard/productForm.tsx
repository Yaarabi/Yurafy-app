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
        owner: Object('654321abcdef123456789012'), // Placeholder owner ID
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
        variants: [],
    });

    const [errors, setErrors] = useState<Partial<Record<keyof IProduct, string>>>({});

    /** Convert uploaded files to Base64 */
    const handleImageUpload = async (
        e: ChangeEvent<HTMLInputElement>,
        field: 'mainImage' | 'images'
    ) => {
        const files = e.target.files;
        if (!files) return;

        const base64Images: string[] = [];

        for (const file of Array.from(files)) {
        const base64 = await toBase64(file);
        base64Images.push(base64 as string);
        }

        setValues((prev) => ({
        ...prev,
        [field]: field === 'mainImage' ? base64Images[0] : base64Images,
        }));
    };

    /** Convert file to Base64 string */
    function toBase64(file: File) {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        });
    }

    /** Handle text, number, and select inputs */
    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        setValues((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
        }));
    }

    /** Basic validation */
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
        className="w-full p-6 bg-gray-900 rounded-xl shadow-lg flex flex-col gap-6"
        >
        {/* Name & Slug in one row */}
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
            <label className="text-sm text-gray-300 font-medium">{t('category')}</label>
            <select
                name="category"
                value={values.category}
                onChange={handleChange}
                className={`px-4 py-2 rounded-lg bg-gray-800 border ${errors.category ? 'border-red-500' : 'border-gray-700'} text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
            >
                <option value="" disabled>{t('selectCategory')}</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            {errors.category && <span className="text-red-500 text-sm">{errors.category}</span>}
            </div>
        </div>

        {/* Main Image & Additional Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 font-medium">{t('mainImage')}</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'mainImage')}
                className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer text-gray-200"
            />
            {values.mainImage && (
                <img src={values.mainImage} alt="Main Preview" className="mt-2 w-full h-60 object-cover rounded-lg border border-gray-700" />
            )}
            </div>

            {/* Additional Images */}
            <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 font-medium">{t('otherImages')}</label>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'images')}
                className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer text-gray-200"
            />
            <div className="flex flex-wrap gap-3 mt-2">
                {values.images?.map((img, idx) => (
                <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="w-28 h-28 object-cover rounded-lg border border-gray-700" />
                ))}
            </div>
            </div>
        </div>

        <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-md'}`}
        >
            {loading ? t('creating') : t('create')}
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
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <input
            className={`px-4 py-2 rounded-lg bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
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
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <textarea
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            rows={4}
            {...props}
        />
        </label>
    );
    }
