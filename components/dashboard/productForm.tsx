'use client';

import { useState, FormEvent, ChangeEvent, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/products';
import { useSession } from 'next-auth/react';
import ProductVariants from './product/ProductVariant';
import BackButton from './BackButton';

const MAX_FILE_SIZE = 10 * 1024 * 1024; 

function isValidFileType(file: File) {
    const allowedTypes = ['image/', 'video/', 'audio/'];
    return allowedTypes.some((type) => file.type.startsWith(type));
}

interface ProductFormProps {
    onSubmit?: (values: Partial<IProduct>) => void;
    loading?: boolean;
    initialValues?: Partial<IProduct>;
    onReset?: () => void;
}

export default function ProductForm({ onSubmit, loading, initialValues, onReset }: ProductFormProps) {
    const t = useTranslations('products.form');
    const { data: session } = useSession();
    
    // Default initial state
    const getInitialState = () => ({
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
        descriptionsImage: [],
        sizes: [],
        colors: [],
        bundles: {
            type: 'buy_x_get_y' as const,
            enabled: false,
        },
        ...initialValues,
    });

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

    const [values, setValues] = useState<Partial<IProduct>>(getInitialState());

    const [showVariants, setShowVariants] = useState(false);
    const [showBundles, setShowBundles] = useState(false); // ✅ Added: Bundle section toggle
    const [errors, setErrors] = useState<Partial<Record<keyof IProduct, string>>>({});

    useEffect(() => {
        if (session?.user?.id) {
        setValues((prev) => ({ ...prev, owner: session.user.id as string }));
        }
    }, [session]);

    // Reset form function
    const resetForm = useCallback(() => {
        const resetState = {
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
            descriptionsImage: [],
            sizes: [],
            colors: [],
            bundles: {
                type: 'buy_x_get_y' as const,
                enabled: false,
            },
        };
        setValues(resetState);
        setErrors({});
        setShowVariants(false);
        setShowBundles(false);
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => {
            (input as HTMLInputElement).value = '';
        });
    }, [session?.user?.id]);

    // Expose reset function to parent
    useEffect(() => {
        // Store reset function in a way that parent can call it
        (window as any).__productFormReset = resetForm;
        return () => {
            delete (window as any).__productFormReset;
        };
    }, [resetForm]);

    const handleImageUpload = async (
        e: ChangeEvent<HTMLInputElement>,
        field: 'mainImage' | 'images' | 'descriptionsImage'
    ) => {
        const files = e.target.files;
        if (!files) return;

        const uploadedUrls: string[] = [];

        for (const file of Array.from(files)) {
        if (!isValidFileType(file)) {
            alert('Unsupported file type. Only images, videos, and audio files are allowed.');
            continue;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert('File too large. Maximum size is 10MB.');
            continue;
        }

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
            : field === 'descriptionsImage'
            ? [...(prev.descriptionsImage || []), ...uploadedUrls]
            : [...(prev.images || []), ...uploadedUrls],
        }));
    };

    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value, type } = e.target;
        // For numeric fields (price, discount, stock), parse as number but keep as string in state
        // This allows text input for flexible values like "buy 2 for $10"
        if (name === 'price' || name === 'discount' || name === 'stock') {
            // Allow empty string or numeric values
            const numValue = value === '' ? 0 : (isNaN(Number(value)) ? 0 : Number(value));
            setValues((prev) => ({
                ...prev,
                [name]: numValue,
            }));
        } else {
            setValues((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
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
        className="w-full relative p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col gap-6 border border-gray-200 dark:border-gray-700"
        >
            <BackButton/>
        {/* Name & Slug */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('name')} name="name" value={values.name || ''} onChange={handleChange} error={errors.name} />
            <Input label={t('slug')} name="slug" value={values.slug || ''} onChange={handleChange} error={errors.slug} />
        </div>

        <Textarea label={t('description')} name="description" value={values.description || ''} onChange={handleChange} />

        {/* Price, Discount, Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label={t('price')} name="price" type="text" value={values.price || ''} onChange={handleChange} error={errors.price} placeholder="0.00" />
            <Input label={t('discount')} name="discount" type="text" value={values.discount || ''} onChange={handleChange} placeholder="0" />
            <Input label={t('stock')} name="stock" type="text" value={values.stock || ''} onChange={handleChange} error={errors.stock} placeholder="0" />
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

        {/* Media Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('mainImage')}</label>
            <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={(e) => handleImageUpload(e, 'mainImage')}
                className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:opacity-90 cursor-pointer text-gray-800 dark:text-gray-200"
            />
            {values.mainImage && (
                <img src={values.mainImage} alt="Main Preview" className="mt-2 w-full h-60 object-cover rounded-lg border border-gray-700" />
            )}
            </div>

            {/* Additional Media */}
            <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('otherImages')}</label>
            <input
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'images')}
                className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:opacity-90 cursor-pointer text-gray-800 dark:text-gray-200"
            />
            <div className="flex flex-wrap gap-3 mt-2">
                {values.images?.map((url, idx) => {
                const ext = url.split('.').pop()?.toLowerCase();
                if (ext?.match(/(jpg|jpeg|png|webp|gif)/)) {
                    return (
                    <div key={idx} className="relative">
                        <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-28 h-28 object-cover rounded-lg border border-gray-700"
                        />
                    </div>
                    );
                } else if (ext?.match(/(mp4|webm|ogg)/)) {
                    return (
                    <video
                        key={idx}
                        src={url}
                        controls
                        className="w-28 h-28 rounded-lg border border-gray-700"
                    />
                    );
                } else if (ext?.match(/(mp3|wav|ogg)/)) {
                    return (
                    <audio
                        key={idx}
                        src={url}
                        controls
                        className="w-28 mt-2"
                    />
                    );
                }
                return null;
                })}
            </div>
            </div>
        </div>

        {/* Description Images Section */}
        <div className="mt-4">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2 block">
                Description Images (Optional)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Images to display in the description section (different from main image and product images)
            </p>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'descriptionsImage')}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            {values.descriptionsImage && values.descriptionsImage.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {values.descriptionsImage.map((url, idx) => (
                        <div key={idx} className="relative">
                            <img
                                src={url}
                                alt={`Description image ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newImages = values.descriptionsImage?.filter((_, i) => i !== idx) || [];
                                    setValues(prev => ({ ...prev, descriptionsImage: newImages }));
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
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

        {/* ✅ Added: Bundles & Promotions Section */}
        <div className="mt-4">
            <button
                type="button"
                onClick={() => setShowBundles((prev) => !prev)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium"
            >
                {showBundles ? 'Hide Bundles & Promotions' : 'Manage Bundles & Promotions'}
            </button>

            {showBundles && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="bundleEnabled"
                            checked={values.bundles?.enabled || false}
                            onChange={(e) => {
                                setValues(prev => ({
                                    ...prev,
                                    bundles: {
                                        ...prev.bundles,
                                        type: prev.bundles?.type || 'buy_x_get_y',
                                        enabled: e.target.checked,
                                    }
                                }));
                            }}
                            className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue"
                        />
                        <label htmlFor="bundleEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Enable Bundle/Promotion
                        </label>
                    </div>

                    {values.bundles?.enabled && (
                        <div className="space-y-4">
                            {/* Bundle Type */}
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2 block">
                                    Promotion Type
                                </label>
                                <select
                                    value={values.bundles?.type || 'buy_x_get_y'}
                                    onChange={(e) => {
                                        setValues(prev => ({
                                            ...prev,
                                            bundles: {
                                                ...prev.bundles,
                                                type: e.target.value as 'buy_x_get_y' | 'special_price' | 'percentage_off',
                                                enabled: true,
                                            }
                                        }));
                                    }}
                                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                >
                                    <option value="buy_x_get_y">Buy X Get Y Free</option>
                                    <option value="special_price">Special Bundle Price</option>
                                    <option value="percentage_off">Percentage Off</option>
                                </select>
                            </div>

                            {/* Buy X Get Y */}
                            {values.bundles?.type === 'buy_x_get_y' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label={t('buyQuantity') || "Buy Quantity (e.g., 2)"}
                                        name="buyQuantity"
                                        type="text"
                                        value={values.bundles?.buyQuantity || ''}
                                        onChange={(e) => {
                                            setValues(prev => ({
                                                ...prev,
                                                bundles: {
                                                    ...prev.bundles,
                                                    buyQuantity: e.target.value,
                                                    enabled: true,
                                                }
                                            }));
                                        }}
                                        placeholder="2"
                                    />
                                    <Input
                                        label={t('getQuantity') || "Get Quantity Free (e.g., 1)"}
                                        name="getQuantity"
                                        type="text"
                                        value={values.bundles?.getQuantity || ''}
                                        onChange={(e) => {
                                            setValues(prev => ({
                                                ...prev,
                                                bundles: {
                                                    ...prev.bundles,
                                                    getQuantity: e.target.value,
                                                    enabled: true,
                                                }
                                            }));
                                        }}
                                        placeholder="1"
                                    />
                                </div>
                            )}

                            {/* Special Price - Buy X for Y */}
                            {values.bundles?.type === 'special_price' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label={t('buyQuantity') || "Buy Quantity (e.g., 2)"}
                                        name="buyQuantity"
                                        type="text"
                                        value={values.bundles?.buyQuantity || ''}
                                        onChange={(e) => {
                                            setValues(prev => ({
                                                ...prev,
                                                bundles: {
                                                    ...prev.bundles,
                                                    buyQuantity: e.target.value,
                                                    enabled: true,
                                                }
                                            }));
                                        }}
                                        placeholder="2"
                                    />
                                    <Input
                                        label={t('specialPrice') || "Special Price (e.g., 10.00)"}
                                        name="specialPrice"
                                        type="text"
                                        value={values.bundles?.specialPrice || ''}
                                        onChange={(e) => {
                                            setValues(prev => ({
                                                ...prev,
                                                bundles: {
                                                    ...prev.bundles,
                                                    specialPrice: e.target.value,
                                                    enabled: true,
                                                }
                                            }));
                                        }}
                                        placeholder="10.00"
                                    />
                                </div>
                            )}

                            {/* Percentage Off */}
                            {values.bundles?.type === 'percentage_off' && (
                                <Input
                                    label={t('percentageOff') || "Discount Percentage (e.g., 20)"}
                                    name="percentageOff"
                                    type="text"
                                    value={values.bundles?.percentageOff || ''}
                                    onChange={(e) => {
                                        setValues(prev => ({
                                            ...prev,
                                            bundles: {
                                                ...prev.bundles,
                                                percentageOff: e.target.value,
                                                enabled: true,
                                            }
                                        }));
                                    }}
                                    placeholder="20"
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${
            loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-brand-blue hover:opacity-90 shadow-md'
            }`}
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
