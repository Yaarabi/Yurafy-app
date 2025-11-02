"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useStore } from '../hooks/useStore';
import toast from 'react-hot-toast';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

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
        getTotal 
    } = useCart();
    
    const { selectedStore } = useStore();
    const [showCheckout, setShowCheckout] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        deliveryInstructions: '',
        preferredTime: '',
    });

    const primaryColor = selectedStore?.theme?.primaryColor || '#0891b2';

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
            toast.error('Your cart is empty');
            return;
        }
        setShowCheckout(true);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!selectedStore?.owner) {
            toast.error('Store information is missing');
            setIsSubmitting(false);
            return;
        }

        try {
            const orderData = {
                owner: selectedStore.owner,
                products: items.map(item => ({
                    product: item.productId,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    color: item.color || undefined,
                    size: item.size || undefined,
                })),
                totalAmount: getTotal(),
                shippingAddress: {
                    fullName: checkoutForm.fullName,
                    phone: checkoutForm.phone,
                    address: checkoutForm.address,
                    city: checkoutForm.city || undefined,
                },
                deliveryInstructions: checkoutForm.deliveryInstructions || undefined,
                preferredTime: checkoutForm.preferredTime || undefined,
            };

            const response = await fetch('/api/orders/guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Order placed successfully! ✅');
                clearCart();
                setShowCheckout(false);
                setCheckoutForm({
                    fullName: '',
                    phone: '',
                    address: '',
                    city: '',
                    deliveryInstructions: '',
                    preferredTime: '',
                });
            } else {
                toast.error(data.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            toast.error('Network error. Please try again.');
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
                    className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: `${primaryColor}20` }}>
                        <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
                            Shopping Cart ({getTotalItems()})
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
                                        <p className="text-lg">Your cart is empty</p>
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
                                                    <h3 className="font-semibold text-sm">{item.product.name}</h3>
                                                    {item.color && (
                                                        <p className="text-xs text-gray-600">Color: {item.color}</p>
                                                    )}
                                                    {item.size && (
                                                        <p className="text-xs text-gray-600">Size: {item.size}</p>
                                                    )}
                                                    <p className="text-sm font-bold mt-1" style={{ color: primaryColor }}>
                                                        ${item.price.toFixed(2)}
                                                    </p>
                                                    
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.productId, -1, item.color, item.size)}
                                                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-100"
                                                            style={{ borderColor: primaryColor }}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.productId, 1, item.color, item.size)}
                                                            className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-100"
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
                                            <span>Subtotal</span>
                                            <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
                                        </div>
                                        {getShippingEstimate() > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Shipping</span>
                                                <span className="font-semibold">${getShippingEstimate().toFixed(2)}</span>
                                            </div>
                                        )}
                                        {getShippingEstimate() === 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Shipping</span>
                                                <span className="font-semibold">FREE</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{ borderColor: `${primaryColor}20` }}>
                                            <span>Total</span>
                                            <span style={{ color: primaryColor }}>${getTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-3 rounded-lg font-bold text-white transition-transform hover:scale-105"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Proceed to Checkout
                                    </button>
                                    <p className="text-xs text-center text-gray-500">
                                        Payment: Cash on Delivery (COD)
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
                                Back to Cart
                            </button>

                            <h3 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                                Customer Details
                            </h3>

                            <form onSubmit={handleSubmitOrder} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={checkoutForm.fullName}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none"
                                        style={{ focusRingColor: primaryColor }}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <PhoneInput
                                        defaultCountry="ma"
                                        value={checkoutForm.phone}
                                        onChange={(phone) => setCheckoutForm({ ...checkoutForm, phone })}
                                        className="w-full border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address *
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={checkoutForm.address}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none"
                                        style={{ focusRingColor: primaryColor }}
                                        placeholder="Enter your delivery address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={checkoutForm.city}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none"
                                        style={{ focusRingColor: primaryColor }}
                                        placeholder="Enter your city (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Instructions
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={checkoutForm.deliveryInstructions}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryInstructions: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none"
                                        style={{ focusRingColor: primaryColor }}
                                        placeholder="Any special delivery instructions (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preferred Delivery Time
                                    </label>
                                    <input
                                        type="text"
                                        value={checkoutForm.preferredTime}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, preferredTime: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none"
                                        style={{ focusRingColor: primaryColor }}
                                        placeholder="e.g., Morning, Afternoon, Evening (optional)"
                                    />
                                </div>

                                {/* Order Summary */}
                                <div className="border-t pt-4 mt-4" style={{ borderColor: `${primaryColor}20` }}>
                                    <h4 className="font-semibold mb-2">Order Summary</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Items ({getTotalItems()})</span>
                                            <span>${getSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>{getShippingEstimate() > 0 ? `$${getShippingEstimate().toFixed(2)}` : 'FREE'}</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: `${primaryColor}20` }}>
                                            <span>Total</span>
                                            <span style={{ color: primaryColor }}>${getTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-lg font-bold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {isSubmitting ? 'Placing Order...' : 'Confirm Order (COD)'}
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

