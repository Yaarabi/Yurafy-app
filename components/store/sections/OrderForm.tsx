import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { normalizePhoneNumber } from '@/lib/utils/phoneUtils';
import { getStoreTranslation } from '../../store/utils/translations';

const OrderForm: React.FC = () => {
    const { selectedProduct, productOptions, setProductOptions, selectedStore } = useStore();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
    });
    const [submissionState, setSubmissionState] = useState<{ status: 'idle' | 'submitting' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });

    const primaryColor = selectedStore?.theme?.primaryColor || '#0891b2';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        if (target.name === 'color' || target.name === 'size') {
            setProductOptions({ ...productOptions, [target.name]: target.value });
        } else {
            setFormData({ ...formData, [target.name]: target.value });
        }
    };

    const handleQuantityChange = (delta: number) => {
        const currentQuantity = productOptions.quantity || 1;
        const newQuantity = Math.max(1, Math.min(currentQuantity + delta, selectedProduct?.stock || 999));
        setProductOptions({ ...productOptions, quantity: newQuantity });
    };

    const storeLanguage = (selectedStore?.language || 'en').split('-')[0]?.toLowerCase() || 'en';
    const isRTL = storeLanguage === 'ar';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate phone number - must be more than just country code
        const phoneDigits = formData.phone.replace(/\D/g, ''); // Remove all non-digits
        if (!formData.phone || formData.phone.trim() === '' || phoneDigits.length < 10) {
            setSubmissionState({ status: 'error', message: 'Phone number is required. Please enter a complete phone number (not just country code).' });
            return;
        }

        if (!formData.fullName || !formData.address) {
            setSubmissionState({ status: 'error', message: 'Full Name, Phone, and Address are required.' });
            return;
        }

        if (!selectedProduct) {
            setSubmissionState({ status: 'error', message: 'Product information is missing.' });
            return;
        }
        
        setSubmissionState({ status: 'submitting', message: '' });

        // Normalize phone number to E.164 format before sending
        const normalizedPhone = normalizePhoneNumber(formData.phone);

        const orderData = {
            owner: selectedProduct.owner,
            products: [
                {
                    product: selectedProduct._id,
                    name: selectedProduct.name,
                    quantity: productOptions.quantity || 1,
                    price: selectedProduct.price,
                    color: productOptions.color,
                    size: productOptions.size,
                },
            ],
            totalAmount: selectedProduct.price * (productOptions.quantity || 1),
            shippingAddress: {
                fullName: formData.fullName,
                phone: normalizedPhone,
                address: formData.address,
            },
        };

        // Use relative path for API endpoint
        console.log('Order payload:', orderData);
        try {
            const res = await fetch('/api/orders/guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            if (res.ok) {
                setSubmissionState({ status: 'success', message: 'Order submitted successfully ✅' });
                setFormData({
                    fullName: '',
                    phone: '',
                    address: '',
                });
                console.log('Order submitted:', orderData);
            } else {
                let errorMsg = 'An error occurred, please try again.';
                try {
                    const errorData = await res.json();
                    if (errorData.error) {
                        errorMsg = errorData.error;
                    }
                    if (errorData.errors) {
                        errorMsg += ': ' + Object.values(errorData.errors).join(', ');
                    }
                    if (errorData.message && !errorMsg.includes(errorData.message)) {
                        errorMsg += ': ' + errorData.message;
                    }
                } catch {}
                setSubmissionState({ status: 'error', message: errorMsg });
            }
        } catch (error) {
            setSubmissionState({ status: 'error', message: 'Network error, please try again.' });
        }
    };
    
    if (submissionState.status === 'success') {
        return (
            <div className="text-center p-8 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <h3 className="text-xl font-bold text-green-800">Thank You!</h3>
                <p className="text-green-700 mt-2">Your order has been placed successfully. We will contact you shortly to confirm.</p>
            </div>
        );
    }

    if (!selectedProduct) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-500">
                <p>No product selected</p>
            </div>
        );
    }

    return (
        <div className={`bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg ${isRTL ? 'text-right' : ''}`} id="order-form" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="mb-6">
                <h3 className={`text-xl sm:text-2xl font-bold text-gray-800 mb-2 ${isRTL ? 'text-right' : ''}`}>{getStoreTranslation('orderDetails', storeLanguage)}</h3>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex-1">
                        <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : ''}`}>{getStoreTranslation('product', storeLanguage)}</p>
                        <p className={`text-base font-semibold text-gray-900 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>{selectedProduct.name}</p>
                    </div>
                    <div className="ml-4 text-right">
                        <p className="text-sm text-gray-600">{getStoreTranslation('price', storeLanguage)}</p>
                        <p className="text-lg font-bold" style={{ color: primaryColor }}>
                            ${((productOptions.quantity || 1) * selectedProduct.price).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Color Selection */}
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div>
                        <label htmlFor="color" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}> 
                            {getStoreTranslation('color', storeLanguage)} {productOptions.color ? `(${productOptions.color})` : '*'}
                        </label>
                        <select
                            name="color"
                            id="color"
                            value={productOptions.color || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                        >
                            <option value="">{getStoreTranslation('selectColor', storeLanguage)}</option>
                            {selectedProduct.colors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Size Selection */}
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                        <label htmlFor="size" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                            {getStoreTranslation('size', storeLanguage)} {productOptions.size ? `(${productOptions.size})` : '*'}
                        </label>
                        <select
                            name="size"
                            id="size"
                            value={productOptions.size || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                        >
                            <option value="">{getStoreTranslation('selectSize', storeLanguage)}</option>
                            {selectedProduct.sizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Quantity - Improved Style */}
                <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>{getStoreTranslation('quantity', storeLanguage)}</label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={(productOptions.quantity || 1) <= 1}
                            className="px-4 py-2.5 border-r border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-gray-700"
                            style={{
                                backgroundColor: (productOptions.quantity || 1) > 1 ? 'white' : '#f3f4f6'
                            }}
                        >
                            −
                        </button>
                        <input
                            type="number"
                            min="1"
                            max={selectedProduct.stock}
                            value={productOptions.quantity || 1}
                            onChange={(e) => {
                                const value = Math.max(1, Math.min(parseInt(e.target.value) || 1, selectedProduct.stock || 999));
                                setProductOptions({ ...productOptions, quantity: value });
                            }}
                            className="w-full text-center px-4 py-2.5 bg-white text-gray-900 border-0 focus:outline-none focus:ring-0 sm:text-sm font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            disabled={(productOptions.quantity || 1) >= (selectedProduct.stock || 999)}
                            className="px-4 py-2.5 border-l border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-gray-700"
                            style={{
                                backgroundColor: (productOptions.quantity || 1) < (selectedProduct.stock || 999) ? 'white' : '#f3f4f6'
                            }}
                        >
                            +
                        </button>
                    </div>
                    {selectedProduct.stock > 0 && (
                        <p className="mt-1 text-xs text-green-600 font-medium">{getStoreTranslation('inStock', storeLanguage)}</p>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <h4 className={`text-lg font-semibold text-gray-800 mb-4 ${isRTL ? 'text-right' : ''}`}>{getStoreTranslation('shippingInformation', storeLanguage)}</h4>
                </div>

                <div>
                    <label htmlFor="fullName" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                        {getStoreTranslation('fullName', storeLanguage)} *
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm ${isRTL ? 'text-right' : ''}`}
                        placeholder="Full name"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                        {getStoreTranslation('phoneNumber', storeLanguage)} *
                    </label>
                    <PhoneInput
                        defaultCountry="ma"
                        value={formData.phone}
                        onChange={(phone) => setFormData({ ...formData, phone })}
                        className={`mt-1 block w-full border rounded-md focus:ring-2 focus:outline-none ${isRTL ? 'text-right' : ''}`}
                        style={{ '--react-international-phone-border-color': '#d1d5db', '--react-international-phone-focus-border-color': primaryColor } as React.CSSProperties}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="address" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                        {getStoreTranslation('fullAddress', storeLanguage)} *
                    </label>
                    <textarea
                        name="address"
                        id="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm ${isRTL ? 'text-right' : ''}`}
                        placeholder="Rue Hassan II, Quartier Agdal, Rabat"
                    />
                </div>
                {submissionState.status === 'error' && (
                    <p className="text-sm text-red-600">{submissionState.message}</p>
                )}
                <div>
                    <button
                        type="submit"
                        disabled={submissionState.status === 'submitting' || selectedProduct.stock <= 0}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {submissionState.status === 'submitting' 
                            ? getStoreTranslation('placingOrder', storeLanguage) 
                            : selectedProduct.stock <= 0 
                                ? getStoreTranslation('outOfStock', storeLanguage) 
                                : getStoreTranslation('placeOrder', storeLanguage)}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrderForm;
