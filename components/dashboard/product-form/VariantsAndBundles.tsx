'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { IProduct } from '@/models/store/products';
import ProductVariants from '../product/ProductVariant';

interface VariantsAndBundlesProps {
    values: Partial<IProduct>;
    setValues: React.Dispatch<React.SetStateAction<Partial<IProduct>>>;
    showVariants: boolean;
    setShowVariants: React.Dispatch<React.SetStateAction<boolean>>;
    showBundles: boolean;
    setShowBundles: React.Dispatch<React.SetStateAction<boolean>>;
    createBundleObject: (type: 'buy_x_get_y' | 'special_price' | 'percentage_off', values: {
        buyQuantity?: number;
        getQuantity?: number;
        specialPrice?: number;
        percentageOff?: number;
    }) => NonNullable<IProduct['bundles']>;
    Input: (props: any) => React.JSX.Element;
}

export default function VariantsAndBundles({
    values,
    setValues,
    showVariants,
    setShowVariants,
    showBundles,
    setShowBundles,
    createBundleObject,
    Input
}: VariantsAndBundlesProps) {
    const t = useTranslations('products.form');

    return (
        <>
            {/* Sizes & Colors */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => setShowVariants((prev) => !prev)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium"
                >
                    {showVariants ? t('hideSizesColors') : t('manageSizesColors')}
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

            {/* Bundles & Promotions Section */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => setShowBundles((prev) => !prev)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium"
                >
                    {showBundles ? t('hideBundles') : t('manageBundles')}
                </button>

                {showBundles && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="bundleEnabled"
                                checked={values.bundles?.enabled || false}
                                onChange={(e) => {
                                    if (!e.target.checked) {
                                        // Remove bundles when disabled
                                        const newValues = { ...values };
                                        delete newValues.bundles;
                                        setValues(newValues);
                                    } else {
                                        // Create a new bundle with default values
                                        setValues({
                                            ...values,
                                            bundles: createBundleObject('buy_x_get_y', { buyQuantity: 0 })
                                        });
                                    }
                                }}
                                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue"
                            />
                            <label htmlFor="bundleEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('enableBundle')}
                            </label>
                        </div>

                        {values.bundles?.enabled && (
                            <div className="space-y-4">
                                {/* Bundle Type */}
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2 block">
                                        {t('promotionType')}
                                    </label>
                                    <select
                                        value={values.bundles.type}
                                        onChange={(e) => {
                                            const type = e.target.value as 'buy_x_get_y' | 'special_price' | 'percentage_off';
                                            setValues({
                                                ...values,
                                                bundles: createBundleObject(type, {
                                                    buyQuantity: values.bundles?.buyQuantity
                                                })
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    >
                                        <option value="buy_x_get_y">{t('buyXGetY')}</option>
                                        <option value="special_price">{t('specialBundlePrice')}</option>
                                        <option value="percentage_off">{t('percentageOffBundle')}</option>
                                    </select>
                                </div>

                                {/* Buy X Get Y */}
                                {values.bundles.type === 'buy_x_get_y' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label={t('buyQuantityPlaceholder')}
                                            name="buyQuantity"
                                            type="number"
                                            min="1"
                                            value={String(values.bundles.buyQuantity || '')}
                                            onChange={(e: any) => {
                                                setValues({
                                                    ...values,
                                                    bundles: createBundleObject('buy_x_get_y', {
                                                        buyQuantity: Number(e.target.value),
                                                        getQuantity: values.bundles?.getQuantity
                                                    })
                                                });
                                            }}
                                            placeholder="2"
                                        />
                                        <Input
                                            label={t('getQuantityPlaceholder')}
                                            name="getQuantity"
                                            type="number"
                                            min="1"
                                            value={String(values.bundles.getQuantity || '')}
                                            onChange={(e: any) => {
                                                setValues({
                                                    ...values,
                                                    bundles: createBundleObject('buy_x_get_y', {
                                                        buyQuantity: values.bundles?.buyQuantity,
                                                        getQuantity: Number(e.target.value)
                                                    })
                                                });
                                            }}
                                            placeholder="1"
                                        />
                                    </div>
                                )}

                                {/* Special Price */}
                                {values.bundles.type === 'special_price' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label={t('buyQuantityPlaceholder')}
                                            name="buyQuantity"
                                            type="number"
                                            min="1"
                                            value={String(values.bundles.buyQuantity || '')}
                                            onChange={(e: any) => {
                                                setValues({
                                                    ...values,
                                                    bundles: createBundleObject('special_price', {
                                                        buyQuantity: Number(e.target.value),
                                                        specialPrice: values.bundles?.specialPrice
                                                    })
                                                });
                                            }}
                                            placeholder="2"
                                        />
                                        <Input
                                            label={t('specialPricePlaceholder')}
                                            name="specialPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={String(values.bundles.specialPrice || '')}
                                            onChange={(e: any) => {
                                                setValues({
                                                    ...values,
                                                    bundles: createBundleObject('special_price', {
                                                        buyQuantity: values.bundles?.buyQuantity,
                                                        specialPrice: Number(e.target.value)
                                                    })
                                                });
                                            }}
                                            placeholder="10.00"
                                        />
                                    </div>
                                )}

                                {/* Percentage Off */}
                                {values.bundles.type === 'percentage_off' && (
                                    <Input
                                        label={t('percentageOffPlaceholder')}
                                        name="percentageOff"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={String(values.bundles.percentageOff || '')}
                                        onChange={(e: any) => {
                                            setValues({
                                                ...values,
                                                bundles: createBundleObject('percentage_off', {
                                                    buyQuantity: values.bundles?.buyQuantity,
                                                    percentageOff: Number(e.target.value)
                                                })
                                            });
                                        }}
                                        placeholder="20"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
