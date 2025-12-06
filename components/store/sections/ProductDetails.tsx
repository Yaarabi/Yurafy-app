
import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useCart } from '../context/CartContext';
import ProductVariantsUI from './ProductVariantsUI';
import toast from 'react-hot-toast';
import { getStoreTranslation } from '../../store/utils/translations';

const ProductDetails: React.FC = () => {
    const { selectedProduct, productOptions, setProductOptions, selectedStore } = useStore();
    const { addToCart, openCart } = useCart();
    const initialImage = selectedProduct?.mainImage || selectedProduct?.images?.[0] || null;
    const [mainImage, setMainImage] = useState<string | null>(initialImage);

    useEffect(() => {
        if (selectedProduct) {
            setMainImage(selectedProduct.mainImage || selectedProduct.images?.[0] || null);
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

    // Language resolution: use user-selected store language from basics form (not route locale)
    const storeLanguage = (selectedStore?.language || 'en').split('-')[0]?.toLowerCase() || 'en';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
                <div className="aspect-square w-full bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
                    {mainImage ? (
                        <img src={mainImage} alt={selectedProduct.name} className="w-full h-full object-cover object-center" />
                    ) : (
                        <div className="w-full h-full bg-gray-200" aria-label={`${selectedProduct.name} placeholder`} />
                    )}
                </div>
                <div className="flex space-x-2">
                    {[selectedProduct.mainImage, ...(selectedProduct.images || [])]
                        .filter(Boolean)
                        .map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setMainImage(img as string)}
                                className={`block h-16 w-16 rounded-md overflow-hidden transition-all duration-200 ${mainImage === img ? 'ring-2 ring-offset-2 ring-[var(--color-primary)]' : 'hover:opacity-80'}`}
                                title={`${selectedProduct.name} thumbnail ${idx + 1}`}
                            >
                                <img src={img as string} alt={`${selectedProduct.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
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

                {/* Bundles & Promotions - Only show if bundles exist and are enabled */}
                {selectedProduct.bundles && selectedProduct.bundles.enabled === true && (
                    <div className="mt-6 p-4 rounded-lg border-2" style={{ 
                        borderColor: primaryColor,
                        backgroundColor: `${primaryColor}15`
                    }}>
                        <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>
                            {getStoreTranslation('ourCollection', storeLanguage)} 🎉
                        </h3>
                        {selectedProduct.bundles.type === 'buy_x_get_y' && selectedProduct.bundles.buyQuantity && selectedProduct.bundles.getQuantity && (
                            <p className="text-base text-gray-700">
                                {`Buy ${selectedProduct.bundles.buyQuantity} Get ${selectedProduct.bundles.getQuantity} Free!`}
                            </p>
                        )}
                        {selectedProduct.bundles.type === 'special_price' && selectedProduct.bundles.specialPrice && (
                            <p className="text-base text-gray-700">
                                {`Special Bundle Price: $${selectedProduct.bundles.specialPrice.toFixed(2)}`}
                            </p>
                        )}
                        {selectedProduct.bundles.type === 'percentage_off' && selectedProduct.bundles.percentageOff && (
                            <p className="text-base text-gray-700">
                                {`${selectedProduct.bundles.percentageOff}% Off on Bundles!`}
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
                        {selectedProduct.stock > 0 ? getStoreTranslation('addToCart', storeLanguage) : getStoreTranslation('outOfStock', storeLanguage)}
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">{getStoreTranslation('specifications', storeLanguage)}</h3>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600">
                        {selectedProduct.category && <div><span className="font-semibold text-gray-800">{getStoreTranslation('category', storeLanguage)}:</span> {selectedProduct.category}</div>}
                        {selectedProduct.brand && <div><span className="font-semibold text-gray-800">{getStoreTranslation('brand', storeLanguage)}:</span> {selectedProduct.brand}</div>}
                        {selectedProduct.stock > 0 && <div><span className="font-semibold text-gray-800">Status:</span> <span className="text-green-600">{getStoreTranslation('inStock', storeLanguage)}</span></div>}
                        {selectedProduct.stock === 0 && <div><span className="font-semibold text-gray-800">Status:</span> <span className="text-red-600">{getStoreTranslation('outOfStock', storeLanguage)}</span></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;