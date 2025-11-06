
import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useCart } from '../context/CartContext';
import ProductVariantsUI from './ProductVariantsUI';
import toast from 'react-hot-toast';

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
                <div className="aspect-square w-full bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
                    <img src={mainImage} alt={selectedProduct.name} className="w-full h-full object-cover object-center" />
                    {/* Image Description Overlay */}
                    {selectedProduct.imageDescriptions && selectedProduct.imageDescriptions.length > 0 && (
                        (() => {
                            const allImages = [selectedProduct.mainImage, ...(selectedProduct.images || [])];
                            const imageIndex = allImages.indexOf(mainImage);
                            const description = imageIndex > 0 ? selectedProduct.imageDescriptions[imageIndex - 1] : null;
                            return description ? (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 text-sm">
                                    {description}
                                </div>
                            ) : null;
                        })()
                    )}
                </div>
                <div className="flex space-x-2">
                    {[selectedProduct.mainImage, ...(selectedProduct.images || [])].map((img, idx) => {
                        const allImages = [selectedProduct.mainImage, ...(selectedProduct.images || [])];
                        const description = idx > 0 && selectedProduct.imageDescriptions ? selectedProduct.imageDescriptions[idx - 1] : null;
                        return (
                            <button 
                                key={idx} 
                                onClick={() => setMainImage(img)}
                                className={`block h-16 w-16 rounded-md overflow-hidden transition-all duration-200 ${mainImage === img ? 'ring-2 ring-offset-2 ring-[var(--color-primary)]' : 'hover:opacity-80'}`}
                                title={description || `${selectedProduct.name} thumbnail ${idx + 1}`}
                            >
                                <img src={img} alt={`${selectedProduct.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
                            </button>
                        );
                    })}
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

                {/* Bundles & Promotions - Only show if bundles exist and are enabled */}
                {selectedProduct.bundles && selectedProduct.bundles.enabled === true && (
                    <div className="mt-6 p-4 rounded-lg border-2" style={{ 
                        borderColor: primaryColor,
                        backgroundColor: `${primaryColor}15`
                    }}>
                        <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>
                            Special Offer! 🎉
                        </h3>
                        {selectedProduct.bundles.type === 'buy_x_get_y' && selectedProduct.bundles.buyQuantity && selectedProduct.bundles.getQuantity && (
                            <p className="text-base text-gray-700">
                                Buy {selectedProduct.bundles.buyQuantity} Get {selectedProduct.bundles.getQuantity} Free!
                            </p>
                        )}
                        {selectedProduct.bundles.type === 'special_price' && selectedProduct.bundles.specialPrice && (
                            <p className="text-base text-gray-700">
                                Special Bundle Price: ${selectedProduct.bundles.specialPrice.toFixed(2)}
                            </p>
                        )}
                        {selectedProduct.bundles.type === 'percentage_off' && selectedProduct.bundles.percentageOff && (
                            <p className="text-base text-gray-700">
                                {selectedProduct.bundles.percentageOff}% Off on Bundles!
                            </p>
                        )}
                    </div>
                )}

                {/* Product Variants UI */}
                <ProductVariantsUI
                    sizes={selectedProduct.sizes}
                    colors={selectedProduct.colors}
                    selectedSize={productOptions.size}
                    selectedColor={productOptions.color}
                    onSizeSelect={(size) => setProductOptions({ ...productOptions, size })}
                    onColorSelect={(color) => setProductOptions({ ...productOptions, color })}
                    primaryColor={primaryColor}
                    stock={selectedProduct.stock}
                />

                {/* Add to Cart Button */}
                <div className="mt-8">
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

                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600">
                        {selectedProduct.category && <div><span className="font-semibold text-gray-800">Category:</span> {selectedProduct.category}</div>}
                        {selectedProduct.brand && <div><span className="font-semibold text-gray-800">Brand:</span> {selectedProduct.brand}</div>}
                        {selectedProduct.stock > 0 && <div><span className="font-semibold text-gray-800">Status:</span> <span className="text-green-600">In Stock</span></div>}
                        {selectedProduct.stock === 0 && <div><span className="font-semibold text-gray-800">Status:</span> <span className="text-red-600">Out of Stock</span></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;