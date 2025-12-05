'use client';

import { useState, FormEvent, ChangeEvent, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/products';
import { useSession } from 'next-auth/react';
import BackButton from './BackButton';
import toast from 'react-hot-toast';
import BasicInfo from './product-form/BasicInfo';
import MediaUploads from './product-form/MediaUploads';
import VariantsAndBundles from './product-form/VariantsAndBundles';
import { Input, Textarea } from './product-form/FormControls';

// Helper function to create valid bundle objects
function createBundleObject(type: 'buy_x_get_y' | 'special_price' | 'percentage_off', values: {
    buyQuantity?: number;
    getQuantity?: number;
    specialPrice?: number;
    percentageOff?: number;
}): NonNullable<IProduct['bundles']> {
    const bundle = {
        type,
        enabled: true,
        buyQuantity: values.buyQuantity || 0
    };

    if (type === 'buy_x_get_y' && values.getQuantity !== undefined) {
        return { ...bundle, getQuantity: values.getQuantity };
    } else if (type === 'special_price' && values.specialPrice !== undefined) {
        return { ...bundle, specialPrice: values.specialPrice };
    } else if (type === 'percentage_off' && values.percentageOff !== undefined) {
        return { ...bundle, percentageOff: values.percentageOff };
    }
    
    return bundle;
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
    const getInitialState = () => {
        const defaultState = {
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
        };

        // Only add bundles if they're enabled in initialValues
        if (initialValues?.bundles?.enabled) {
            return {
                ...defaultState,
                ...initialValues,
                bundles: createBundleObject(
                    initialValues.bundles.type,
                    {
                        buyQuantity: initialValues.bundles.buyQuantity,
                        getQuantity: initialValues.bundles.getQuantity,
                        specialPrice: initialValues.bundles.specialPrice,
                        percentageOff: initialValues.bundles.percentageOff,
                    }
                )
            };
        }

        return { ...defaultState, ...initialValues };
    };

    const DEFAULT_CATEGORIES = [
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

    const [storeCategories, setStoreCategories] = useState<string[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [values, setValues] = useState<Partial<IProduct>>(getInitialState());
    const [showVariants, setShowVariants] = useState(false);
    const [showBundles, setShowBundles] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof IProduct, string>>>({});

    useEffect(() => {
        if (session?.user?.id) {
            setValues((prev) => ({ ...prev, owner: session.user.id as string }));
        }
    }, [session]);

    // Fetch store categories
    useEffect(() => {
        async function fetchStoreCategories() {
            try {
                setLoadingCategories(true);
                const res = await fetch('/api/store/owner');
                if (res.ok) {
                    const data = await res.json();
                    if (data.categories && Array.isArray(data.categories)) {
                        const categoryNames = data.categories.map((cat: { name: string; img: string }) => cat.name);
                        setStoreCategories(categoryNames);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch store categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        }
        fetchStoreCategories();
    }, []);

    // Combine default categories with store categories
    const PRODUCT_CATEGORIES = [
        ...storeCategories,
        ...DEFAULT_CATEGORIES.filter(cat => !storeCategories.includes(cat)),
    ];

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
        (window as any).__productFormReset = resetForm;
        return () => {
            delete (window as any).__productFormReset;
        };
    }, [resetForm]);

    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        if (name === 'price' || name === 'discount' || name === 'stock') {
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
        
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            if (firstError) {
                toast.error(firstError);
            }
        }
        
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        onSubmit?.(values);
    }

    return (
        <form onSubmit={handleSubmit} className="w-full relative p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col gap-4 sm:gap-6 border border-gray-200 dark:border-gray-700">
            <BackButton/>
            
            <BasicInfo 
                values={values}
                handleChange={handleChange}
                errors={errors}
                Input={Input}
                Textarea={Textarea}
                PRODUCT_CATEGORIES={PRODUCT_CATEGORIES}
                loadingCategories={loadingCategories}
            />

            <MediaUploads values={values} setValues={setValues} />

            <VariantsAndBundles
                values={values}
                setValues={setValues}
                showVariants={showVariants}
                setShowVariants={setShowVariants}
                showBundles={showBundles}
                setShowBundles={setShowBundles}
                createBundleObject={createBundleObject}
                Input={Input}
            />

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