"use client"
import React from 'react';
import { IProduct } from '@/models/products';

interface ProductCardProps {
    product: IProduct;
    onProductSelect: (product: IProduct) => void;
    layout?: 'grid' | 'list' | 'masonry';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect, layout = 'grid' }) => {
    const hasDiscount = product.discount && product.discount > 0;
    const discountedPrice = hasDiscount ? product.price - (product.price * product.discount! / 100) : product.price;

    // List layout
    if (layout === 'list') {
        return (
            <div onClick={() => onProductSelect(product)} className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl flex gap-4">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                    {hasDiscount && (
                        <div className="absolute top-1 right-1 px-2 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-color)' }}>
                            -{product.discount}%
                        </div>
                    )}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                    )}
                    <div className="flex items-baseline mt-2">
                        <p className="text-xl font-bold" style={{color: 'var(--primary-color)'}}>${discountedPrice.toFixed(2)}</p>
                        {hasDiscount && <p className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</p>}
                    </div>
                </div>
            </div>
        );
    }

    // Grid/Masonry layout (default)
    return (
        <div onClick={() => onProductSelect(product)} className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="relative">
                <img src={product.mainImage} alt={product.name} className="w-full h-64 object-cover" />
                {hasDiscount && (
                    <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-color)' }}>
                        -{product.discount}%
                    </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                <div className="flex items-baseline mt-2">
                    <p className="text-xl font-bold" style={{color: 'var(--primary-color)'}}>${discountedPrice.toFixed(2)}</p>
                    {hasDiscount && <p className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</p>}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
