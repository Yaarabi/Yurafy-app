"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { SerializedStore } from '@/lib/data/products';
import { IProduct } from '@/models/store/products';
import { CartProvider } from './CartContext';

export type StoreContextValue = {
    stores: SerializedStore[];
    selectedStore: SerializedStore | null;
    selectStore: (id: string) => void;
    changeStore: () => void;
    selectedProduct: IProduct | null;
    selectProduct: (p: IProduct) => void;
    productOptions: Record<string, any>;
    setProductOptions: (o: Record<string, any>) => void;
    goHome: () => void;
    products: IProduct[];
    disableNavigation?: boolean;
};

export const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{
    children: ReactNode;
    stores?: SerializedStore[];
    initialStore?: SerializedStore | null;
    products?: IProduct[];
    disableNavigation?: boolean;
}> = ({ children, stores = [], initialStore = null, products = [], disableNavigation = false }) => {
    const [allStores] = useState<SerializedStore[]>(stores);
    const [selectedStore, setSelectedStore] = useState<SerializedStore | null>(initialStore || (stores[0] ?? null));
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    const [productOptions, setProductOptions] = useState<Record<string, any>>({});
    const [allProducts, setAllProducts] = useState<IProduct[]>(products);
    
    // ✅ FIXED: Use ref to track previous products and prevent infinite loop
    const prevProductsRef = useRef<IProduct[]>(products);
    const getProductsString = (prods: IProduct[]): string => {
        try {
            return JSON.stringify((prods || []).map(p => p?._id || '').filter(Boolean).sort());
        } catch {
            return '';
        }
    };
    const productsStringRef = useRef<string>(getProductsString(products));

    // Update selectedStore when initialStore changes (for real-time preview updates)
    useEffect(() => {
        if (initialStore) {
            setSelectedStore(initialStore);
        }
    }, [initialStore]);

    // ✅ FIXED: Update products when products prop changes (using ref comparison to prevent infinite loop)
    useEffect(() => {
        // Normalize products array
        const normalizedProducts = products || [];
        const normalizedPrevProducts = prevProductsRef.current || [];
        
        // Compare using JSON stringified sorted IDs to avoid unnecessary updates
        const currentProductsString = getProductsString(normalizedProducts);
        
        // Only update if products actually changed (different IDs or length)
        const hasChanged = 
            currentProductsString !== productsStringRef.current || 
            normalizedPrevProducts.length !== normalizedProducts.length;
        
        if (hasChanged) {
            prevProductsRef.current = normalizedProducts;
            productsStringRef.current = currentProductsString;
            setAllProducts(normalizedProducts);
        }
    }, [products]); // Safe to depend on products array now

    const selectStore = useCallback((id: string) => {
        const s = allStores.find((st) => st._id === id) ?? null;
        setSelectedStore(s);
    }, [allStores]);

    const changeStore = useCallback(() => {
        // simple behavior: deselect store to force selection UI
        setSelectedStore(null);
    }, []);

    const selectProduct = useCallback((p: IProduct) => {
        setSelectedProduct(p);
    }, []);

    const goHome = useCallback(() => {
        setSelectedProduct(null);
        // Navigation is handled in the component that uses goHome
    }, []);

    const value: StoreContextValue = {
        stores: allStores,
        selectedStore,
        selectStore,
        changeStore,
        selectedProduct,
        selectProduct,
        productOptions,
        setProductOptions,
        goHome,
        products: allProducts,
        disableNavigation,
    };

    return (
        <StoreContext.Provider value={value}>
            <CartProvider>
                {children}
            </CartProvider>
        </StoreContext.Provider>
    );
};

export default StoreProvider;
