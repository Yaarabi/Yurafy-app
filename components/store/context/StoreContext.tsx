"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SerializedStore } from '@/lib/data/products';
import { IProduct } from '@/models/products';
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
};

export const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{
    children: ReactNode;
    stores?: SerializedStore[];
    initialStore?: SerializedStore | null;
    products?: IProduct[];
}> = ({ children, stores = [], initialStore = null, products = [] }) => {
    const [allStores] = useState<SerializedStore[]>(stores);
    const [selectedStore, setSelectedStore] = useState<SerializedStore | null>(initialStore || (stores[0] ?? null));
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    const [productOptions, setProductOptions] = useState<Record<string, any>>({});
    const [allProducts, setAllProducts] = useState<IProduct[]>(products);

    // Update selectedStore and products when initialStore changes (for real-time preview updates)
    useEffect(() => {
        if (initialStore) {
            setSelectedStore(initialStore);
        }
    }, [initialStore]);

    // Update products when products prop changes
    useEffect(() => {
        setAllProducts(products);
    }, [products]);

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
