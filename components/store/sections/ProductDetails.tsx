
import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useCart } from '../context/CartContext';

const ProductDetails: React.FC = () => {
    const { selectedProduct, productOptions, setProductOptions, selectedStore } = useStore();
    const { addToCart, openCart } = useCart();
    const [mainImage, setMainImage] = useState(selectedProduct?.mainImage || '');

    useEffect(() => {
        if (selectedProduct) {
            setMainImage(selectedProduct.mainImage);
        }
    }, [selectedProduct]);

    if (!selectedProduct) return null;

    const primaryColor = selectedStore?.theme?.primaryColor || '#0891b2';

    const handleQuantityChange = (delta: number) => {
        const newQuantity = Math.max(1, productOptions.quantity + delta);
        setProductOptions({ quantity: newQuantity });
    };

    const handleAddToCart = () => {
        const success = addToCart(
            selectedProduct,
            productOptions.quantity || 1,
            {
                color: productOptions.color,
                size: productOptions.size,
                metadata: {
                    merchantId: selectedStore?.owner,
                },
            }
        );
        
        if (success) {
            // Optionally open cart after adding
            setTimeout(() => openCart(), 500);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
                <div className="aspect-square w-full bg-gray-200 rounded-lg overflow-hidden mb-4">
                    <img src={mainImage} alt={selectedProduct.name} className="w-full h-full object-cover object-center" />
                </div>
                <div className="flex space-x-2">
                    {[selectedProduct.mainImage, ...selectedProduct.images].map((img, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setMainImage(img)}
                            className={`block h-16 w-16 rounded-md overflow-hidden transition-all duration-200 ${mainImage === img ? 'ring-2 ring-offset-2 ring-[var(--color-primary)]' : 'hover:opacity-80'}`}
                        >
                            <img src={img} alt={`${selectedProduct.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">{selectedProduct.name}</h1>
                <div className="mt-3">
                    <p className="text-3xl text-gray-900">${selectedProduct.price.toFixed(2)}</p>
                </div>
                <div className="mt-6">
                    <p className="text-base text-gray-700">{selectedProduct.description}</p>
                </div>

                {/* Options */}
                <div className="mt-8 space-y-6">
                    {/* Colors */}
                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Color</h3>
                            <div className="flex items-center space-x-3 mt-2">
                                {selectedProduct.colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setProductOptions({ color })}
                                        className={`relative h-8 w-8 rounded-full border border-gray-300 transition-transform transform hover:scale-110 ${productOptions.color === color ? 'ring-2 ring-offset-2 ring-[var(--color-primary)]' : ''}`}
                                        style={{ backgroundColor: color }}
                                    >
                                      <span className="sr-only">{color}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Sizes */}
                     {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Size</h3>
                            <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4 mt-2">
                                {selectedProduct.sizes.map(size => (
                                     <button
                                        key={size}
                                        type="button"
                                        onClick={() => setProductOptions({ size })}
                                        className={`group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 ${productOptions.size === size ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'bg-white text-gray-900'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                     {/* Quantity */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                        <div className="flex items-center mt-2">
                            <button onClick={() => handleQuantityChange(-1)} className="px-3 py-1 border rounded-l-md hover:bg-gray-100">-</button>
                            <span className="px-4 py-1 border-t border-b">{productOptions.quantity || 1}</span>
                            <button onClick={() => handleQuantityChange(1)} className="px-3 py-1 border rounded-r-md hover:bg-gray-100">+</button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="mt-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={selectedProduct.stock <= 0}
                            className="w-full py-3 px-4 rounded-md font-semibold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{ 
                                backgroundColor: selectedProduct.stock > 0 ? primaryColor : '#9CA3AF'
                            }}
                        >
                            {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600">
                        {selectedProduct.category && <div><span className="font-semibold text-gray-800">Category:</span> {selectedProduct.category}</div>}
                        {selectedProduct.brand && <div><span className="font-semibold text-gray-800">Brand:</span> {selectedProduct.brand}</div>}
                        {selectedProduct.stock > 0 && <div><span className="font-semibold text-gray-800">Status:</span> <span className="text-green-600">In Stock ({selectedProduct.stock} left)</span></div>}
                        {selectedProduct.stock === 0 && <div><span className="font-semibold text-gray-800">Status:</span> <span className="text-red-600">Out of Stock</span></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;