"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useStore } from '../hooks/useStore';
import toast from 'react-hot-toast';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { normalizePhoneNumber } from '@/lib/utils/phoneUtils';
import { getStoreTranslation } from '../utils/translations';

const Cart: React.FC = () => {
    const { 
        items, 
        isOpen, 
        closeCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        getTotalItems, 
        getSubtotal, 
        getShippingEstimate, 
        getTotal,
        getItemUnitPrice,
        getItemTotal,
    } = useCart();
    
    const { selectedStore } = useStore();
    const [showCheckout, setShowCheckout] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
    });
    const [itemVariants, setItemVariants] = useState<Record<string, { color?: string; size?: string }>>({});

    const primaryColor = selectedStore?.theme?.primaryColor || '#0891b2';
    const storeLanguage = (selectedStore?.language || 'en').split('-')[0]?.toLowerCase() || 'en';
    const isRTL = storeLanguage === 'ar';
    const t = useCallback((key: string) => getStoreTranslation(key, storeLanguage), [storeLanguage]);

    // Initialize itemVariants when items change
    useEffect(() => {
        const variants: Record<string, { color?: string; size?: string }> = {};
        items.forEach(item => {
            const itemKey = `${item.productId}-${item.color || 'no-color'}-${item.size || 'no-size'}`;
            variants[itemKey] = { color: item.color, size: item.size };
        });
        setItemVariants(variants);
    }, [items]);

    // Determine the cart currency: prefer if all product currencies are the same
    const cartCurrency = (() => {
        const currencies = Array.from(new Set(items.map(i => i.product.currency).filter(Boolean)));
        if (currencies.length === 1) return currencies[0];
        // Fallback to first item's currency or '$'
        return items.length > 0 ? (items[0].product.currency || '$') : '$';
    })();

    const handleQuantityChange = (productId: string, delta: number, color?: string, size?: string) => {
        const item = items.find(
            item => item.productId === productId && 
            item.color === color && 
            item.size === size
        );
        if (item) {
            updateQuantity(productId, item.quantity + delta, color, size);
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            toast.error(t('cartEmpty'));
            return;
        }
        setShowCheckout(true);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate phone number - must be more than just country code
        const phoneDigits = checkoutForm.phone.replace(/\D/g, ''); // Remove all non-digits
        if (!checkoutForm.phone || checkoutForm.phone.trim() === '' || phoneDigits.length < 10) {
            toast.error(t('phoneRequired'));
            setIsSubmitting(false);
            return;
        }

        if (!selectedStore?.owner) {
            toast.error(t('storeMissing'));
            setIsSubmitting(false);
            return;
        }

        try {
            const orderData = {
                owner: selectedStore.owner,
                products: items.map(item => {
                    const itemKey = `${item.productId}-${item.color || 'no-color'}-${item.size || 'no-size'}`;
                    const variant = itemVariants[itemKey] || {};
                    return {
                        product: item.productId,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: getItemUnitPrice(item.productId, item.color, item.size),
                        lineTotal: getItemTotal(item.productId, item.color, item.size),
                        color: variant.color || item.color || undefined,
                        size: variant.size || item.size || undefined,
                    };
                }),
                totalAmount: getTotal(),
                currency: cartCurrency,
                shippingAmount: getShippingEstimate(),
                shippingAddress: {
                    fullName: checkoutForm.fullName,
                    phone: normalizePhoneNumber(checkoutForm.phone), // Normalize to E.164 format
                    address: checkoutForm.address,
                    city: checkoutForm.city || undefined,
                },
            };

            const response = await fetch('/api/orders/guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(t('orderSuccess'));
                clearCart();
                setShowCheckout(false);
                setCheckoutForm({
                    fullName: '',
                    phone: '',
                    address: '',
                    city: '',
                });
                setItemVariants({});
            } else {
                toast.error(data.error || t('orderFailure'));
            }
        } catch (error) {
            console.error('Order submission error:', error);
            toast.error(t('networkError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50"
                    onClick={closeCart}
                />

                {/* Cart Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.3 }}
                    className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col ${isRTL ? 'text-right' : ''}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: `${primaryColor}20` }}>
                            <h2 className={`text-xl font-bold ${isRTL ? 'text-right' : ''}`} style={{ color: primaryColor }}>
                            {t('shoppingCart')} ({getTotalItems()})
                        </h2>
                        <button
                            onClick={closeCart}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
                            aria-label="Close cart"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {!showCheckout ? (
                        <>
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <svg className="w-24 h-24 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-lg">{t('cartEmpty')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div
                                                key={`${item.productId}-${item.color || 'no-color'}-${item.size || 'no-size'}-${index}`}
                                                className="flex gap-4 p-4 border rounded-lg"
                                                style={{ borderColor: `${primaryColor}20` }}
                                            >
                                                <img
                                                    src={item.product.mainImage}
                                                    alt={item.product.name}
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.product.name}</h3>
                                                    {item.color && (
                                                        <p className={`text-xs text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : ''}`}>{t('color')}: {item.color}</p>
                                                    )}
                                                    {item.size && (
                                                        <p className={`text-xs text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : ''}`}>{t('size')}: {item.size}</p>
                                                    )}
                                                    <p className="text-sm font-bold mt-1" style={{ color: primaryColor }}>
                                                        {item.product.currency || cartCurrency}{getItemUnitPrice(item.productId, item.color, item.size).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{t('total')}: {item.product.currency || cartCurrency}{getItemTotal(item.productId, item.color, item.size).toFixed(2)}</p>
                                                    
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.productId, -1, item.color, item.size)}
                                                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-100 text-gray-900 dark:text-gray-100"
                                                            style={{ borderColor: primaryColor }}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.productId, 1, item.color, item.size)}
                                                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-100 text-gray-900 dark:text-gray-100"
                                                            style={{ borderColor: primaryColor }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={() => removeFromCart(item.productId, item.color, item.size)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    aria-label="Remove item"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer with Totals and Checkout */}
                            {items.length > 0 && (
                                <div className="border-t p-4 space-y-4" style={{ borderColor: `${primaryColor}20` }}>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className={`${isRTL ? 'text-right' : ''}`}>{t('subtotal')}</span>
                                            <span className="font-semibold">{cartCurrency}{getSubtotal().toFixed(2)}</span>
                                        </div>
                                        {getShippingEstimate() > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className={`${isRTL ? 'text-right' : ''}`}>{t('shipping')}</span>
                                                <span className="font-semibold">{cartCurrency}{getShippingEstimate().toFixed(2)}</span>
                                            </div>
                                        )}
                                        {getShippingEstimate() === 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span className={`${isRTL ? 'text-right' : ''}`}>{t('shipping')}</span>
                                                <span className="font-semibold">{t('free')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{ borderColor: `${primaryColor}20` }}>
                                            <span className={`${isRTL ? 'text-right' : ''}`}>{t('total')}</span>
                                            <span style={{ color: primaryColor }}>{cartCurrency}{getTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-3 rounded-lg font-bold text-white transition-transform hover:scale-105"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {t('proceedToCheckout')}
                                    </button>
                                    <p className="text-xs text-center text-gray-500">
                                        {`${t('payment')}: ${t('cashOnDelivery')} (COD)`}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Checkout Form */
                        <div className="flex-1 overflow-y-auto p-4">
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="mb-4 text-sm flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                {t('backToCart')}
                            </button>

                            <h3 className={`text-lg font-bold mb-4 ${isRTL ? 'text-right' : ''}`} style={{ color: primaryColor }}>
                                {t('customerDetails')}
                            </h3>

                            <form onSubmit={handleSubmitOrder} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                                        {`${t('fullName')} *`}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={checkoutForm.fullName}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                                        className={`w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:outline-none placeholder-gray-400 ${isRTL ? 'text-right' : ''}`}
                                        style={{ outlineColor: primaryColor }}
                                        placeholder={t('fullNamePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                                        {`${t('phoneNumber')} *`}
                                    </label>
                                    <PhoneInput
                                        defaultCountry="ma"
                                        value={checkoutForm.phone}
                                        onChange={(phone) => setCheckoutForm({ ...checkoutForm, phone })}
                                        className={`w-full border rounded-md focus:ring-2 focus:outline-none ${isRTL ? 'text-right' : ''}`}
                                        style={{ '--react-international-phone-border-color': '#d1d5db', '--react-international-phone-focus-border-color': primaryColor } as React.CSSProperties}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                                        {`${t('address')} *`}
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={checkoutForm.address}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                                        className={`w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:outline-none placeholder-gray-400 ${isRTL ? 'text-right' : ''}`}
                                        style={{ outlineColor: primaryColor }}
                                        placeholder={t('addressPlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                                        {t('city')}
                                    </label>
                                    <input
                                        type="text"
                                        value={checkoutForm.city}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                                        className={`w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:outline-none placeholder-gray-400 ${isRTL ? 'text-right' : ''}`}
                                        style={{ outlineColor: primaryColor }}
                                        placeholder={t('cityOptionalPlaceholder')}
                                    />
                                </div>

                                {/* Product Variants Selection */}
                                {items.length > 0 && (
                                    <div className="border-t pt-4 mt-4" style={{ borderColor: `${primaryColor}20` }}>
                                        <h4 className={`font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>{t('productOptions')}</h4>
                                        <div className="space-y-4">
                                            {items.map((item) => {
                                                const itemKey = `${item.productId}-${item.color || 'no-color'}-${item.size || 'no-size'}`;
                                                const variant = itemVariants[itemKey] || { color: item.color, size: item.size };
                                                
                                                return (
                                                    <div key={itemKey} className="p-3 bg-gray-50 rounded-md">
                                                        <p className="text-sm font-medium text-gray-900 mb-2">{item.product.name}</p>
                                                        
                                                        {/* Color Selection */}
                                                        {item.product.colors && item.product.colors.length > 0 && (
                                                            <div className="mb-2">
                                                                <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                                                                    {t('color')}
                                                                </label>
                                                                <select
                                                                    value={variant.color || ''}
                                                                    onChange={(e) => setItemVariants({
                                                                        ...itemVariants,
                                                                        [itemKey]: { ...variant, color: e.target.value || undefined }
                                                                    })}
                                                                    className={`w-full px-3 py-2 text-sm border rounded-md bg-white text-gray-900 focus:ring-2 focus:outline-none ${isRTL ? 'text-right' : ''}`}
                                                                    style={{ outlineColor: primaryColor }}
                                                                >
                                                                    <option value="">{t('selectColor')}</option>
                                                                    {item.product.colors.map((color: string) => (
                                                                        <option key={color} value={color}>{color}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Size Selection */}
                                                        {item.product.sizes && item.product.sizes.length > 0 && (
                                                            <div>
                                                                <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                                                                    {t('size')}
                                                                </label>
                                                                <select
                                                                    value={variant.size || ''}
                                                                    onChange={(e) => setItemVariants({
                                                                        ...itemVariants,
                                                                        [itemKey]: { ...variant, size: e.target.value || undefined }
                                                                    })}
                                                                    className={`w-full px-3 py-2 text-sm border rounded-md bg-white text-gray-900 focus:ring-2 focus:outline-none ${isRTL ? 'text-right' : ''}`}
                                                                    style={{ outlineColor: primaryColor }}
                                                                >
                                                                    <option value="">{t('selectSize')}</option>
                                                                    {item.product.sizes.map((size: string) => (
                                                                        <option key={size} value={size}>{size}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div className="border-t pt-4 mt-4" style={{ borderColor: `${primaryColor}20` }}>
                                    <h4 className="font-semibold mb-2">{t('orderSummary')}</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>{`${t('items')} (${getTotalItems()})`}</span>
                                            <span>{cartCurrency}{getSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('shipping')}</span>
                                            <span>{getShippingEstimate() > 0 ? `${cartCurrency}${getShippingEstimate().toFixed(2)}` : t('free')}</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: `${primaryColor}20` }}>
                                            <span>{t('total')}</span>
                                            <span style={{ color: primaryColor }}>{cartCurrency}{getTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-lg font-bold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {isSubmitting ? t('placingOrder') : t('placeOrder')}
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Cart;

