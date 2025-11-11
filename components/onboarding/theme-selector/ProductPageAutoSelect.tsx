"use client";

import { useEffect } from 'react';
import { useStore } from '@/components/store/hooks/useStore';
import type { IProduct } from '@/models/products';

type PreviewPage = 'STORE_PAGE' | 'PRODUCT_PAGE';

interface ProductPageAutoSelectProps {
    product: IProduct | undefined;
    currentPage: PreviewPage;
}

const ProductPageAutoSelect: React.FC<ProductPageAutoSelectProps> = ({ product, currentPage }) => {
    const { selectProduct, goHome } = useStore();

    useEffect(() => {
        if (currentPage === 'PRODUCT_PAGE' && product) {
            selectProduct(product);
            return;
        }

        if (currentPage === 'STORE_PAGE') {
            goHome();
        }
    }, [currentPage, product, goHome, selectProduct]);

    return null;
};

export default ProductPageAutoSelect;
