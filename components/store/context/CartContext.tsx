"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { IProduct } from '@/models/products';
import toast from 'react-hot-toast';
import { getStoreTranslation } from '../utils/translations';
import { useStore } from '../hooks/useStore';

const CART_STORAGE_KEY = 'cart_items';

export interface CartItem {
    productId: string;
    product: IProduct;
    quantity: number;
    color?: string;
    size?: string;
    price: number;
    metadata?: {
        themeSection?: string;
        merchantId?: string;
    };
}

export interface CartContextValue {
    items: CartItem[];
    isOpen: boolean;
    addToCart: (product: IProduct, quantity: number, options?: { color?: string; size?: string; metadata?: CartItem['metadata'] }) => boolean;
    removeFromCart: (productId: string, color?: string, size?: string) => void;
    updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getSubtotal: () => number;
    getShippingEstimate: () => number;
    getTotal: () => number;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { selectedStore } = useStore();
    const storeLanguage = selectedStore?.language?.split('-')[0]?.toLowerCase() || 'en';
    const t = useCallback((key: string) => getStoreTranslation(key, storeLanguage), [storeLanguage]);

    // Load cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(CART_STORAGE_KEY);
                if (stored) {
                    const parsedItems = JSON.parse(stored);
                    if (Array.isArray(parsedItems)) {
                        setItems(parsedItems);
                    }
                }
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                localStorage.removeItem(CART_STORAGE_KEY);
            }
        }
    }, []);

    // Save cart to localStorage whenever items change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                if (items.length > 0) {
                    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
                } else {
                    localStorage.removeItem(CART_STORAGE_KEY);
                }
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
        }
    }, [items]);

    // Generate unique key for cart item (productId + color + size)
    const getItemKey = (productId: string, color?: string, size?: string): string => {
        return `${productId}-${color || 'no-color'}-${size || 'no-size'}`;
    };

    const addToCart = useCallback((product: IProduct, quantity: number, options?: { color?: string; size?: string; metadata?: CartItem['metadata'] }): boolean => {
        if (product.stock <= 0) {
            toast.error(t('productOutOfStock'));
            return false;
        }

        const existingItem = items.find(
            item => item.productId === product._id && 
            item.color === options?.color && 
            item.size === options?.size
        );

        const currentQuantity = existingItem ? existingItem.quantity : 0;
        if (currentQuantity + quantity > product.stock) {
            toast.error(t('onlyItemsAvailable').replace('{count}', String(product.stock)));
            return false;
        }

        setItems(prev => {
            const itemKey = getItemKey(product._id!, options?.color, options?.size);
            const existingIndex = prev.findIndex(
                item => getItemKey(item.productId, item.color, item.size) === itemKey
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity,
                };
                return updated;
            } else {
                return [...prev, {
                    productId: product._id!,
                    product,
                    quantity,
                    color: options?.color,
                    size: options?.size,
                    price: product.price,
                    metadata: options?.metadata,
                }];
            }
        });

        toast.success(t('addedToCart'));
        return true;
    }, [items, t]);

    const removeFromCart = useCallback((productId: string, color?: string, size?: string) => {
        setItems(prev => prev.filter(
            item => getItemKey(item.productId, item.color, item.size) !== 
                    getItemKey(productId, color, size)
        ));
        toast.success(t('itemRemoved'));
    }, [t]);

    const updateQuantity = useCallback((productId: string, quantity: number, color?: string, size?: string) => {
        if (quantity <= 0) {
            removeFromCart(productId, color, size);
            return;
        }

        setItems(prev => {
            const itemKey = getItemKey(productId, color, size);
            return prev.map(item => {
                if (getItemKey(item.productId, item.color, item.size) === itemKey) {
                    if (quantity > item.product.stock) {
                        toast.error(t('onlyItemsAvailable').replace('{count}', String(item.product.stock)));
                        return item;
                    }
                    return { ...item, quantity };
                }
                return item;
            });
        });
    }, [removeFromCart, t]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);
    const clearCart = useCallback(() => {
        setItems([]);
        setIsOpen(false);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, []);

    const getTotalItems = useCallback(() => {
        return items.reduce((total, item) => total + item.quantity, 0);
    }, [items]);

    const getSubtotal = useCallback(() => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [items]);

    const getShippingEstimate = useCallback(() => {
        // Simple shipping estimate: 50 if subtotal < 500, free otherwise
        const subtotal = getSubtotal();
        return subtotal < 500 ? 50 : 0;
    }, [getSubtotal]);

    const getTotal = useCallback(() => {
        return getSubtotal() + getShippingEstimate();
    }, [getSubtotal, getShippingEstimate]);

    const value: CartContextValue = {
        items,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        openCart,
        closeCart,
        toggleCart,
        clearCart,
        getTotalItems,
        getSubtotal,
        getShippingEstimate,
        getTotal,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

