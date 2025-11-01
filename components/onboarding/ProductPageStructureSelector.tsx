'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ShoppingCart, ImageIcon, Tag, Star, Package, ArrowRight, Check } from 'lucide-react';

interface ProductPageStructure {
    productDetails: boolean;
    productImages: boolean;
    productDescription: boolean;
    productPrice: boolean;
    productVariants: boolean;
    orderForm: boolean;
    relatedProducts: boolean;
    reviews: boolean;
}

interface ProductPageStructureSelectorProps {
    onSelect: (productPageStructure: ProductPageStructure) => void;
    selectedTheme: {
        themeId: number;
        theme: { primaryColor: string; secondaryColor?: string; textColor?: string };
    };
}

const productPageOptions = [
    {
        key: 'productDetails' as const,
        label: 'Product Details',
        description: 'Product name and basic information',
        icon: ShoppingBag,
        default: true,
    },
    {
        key: 'productImages' as const,
        label: 'Product Images',
        description: 'Image gallery and zoom functionality',
        icon: ImageIcon,
        default: true,
    },
    {
        key: 'productDescription' as const,
        label: 'Description',
        description: 'Detailed product description',
        icon: Tag,
        default: true,
    },
    {
        key: 'productPrice' as const,
        label: 'Price & Discount',
        description: 'Pricing information and discounts',
        icon: Tag,
        default: true,
    },
    {
        key: 'productVariants' as const,
        label: 'Variants',
        description: 'Product variants (size, color, etc.)',
        icon: Package,
        default: false,
    },
    {
        key: 'orderForm' as const,
        label: 'Order Form',
        description: 'Order placement form',
        icon: ShoppingCart,
        default: true,
    },
    {
        key: 'relatedProducts' as const,
        label: 'Related Products',
        description: 'Show similar products',
        icon: ShoppingBag,
        default: false,
    },
    {
        key: 'reviews' as const,
        label: 'Reviews',
        description: 'Customer reviews and ratings',
        icon: Star,
        default: false,
    },
];

export default function ProductPageStructureSelector({ onSelect, selectedTheme }: ProductPageStructureSelectorProps) {
    const [productPageStructure, setProductPageStructure] = useState<ProductPageStructure>({
        productDetails: true,
        productImages: true,
        productDescription: true,
        productPrice: true,
        productVariants: false,
        orderForm: true,
        relatedProducts: false,
        reviews: false,
    });

    const handleToggle = (key: keyof ProductPageStructure) => {
        setProductPageStructure(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleContinue = () => {
        onSelect(productPageStructure);
    };

    const primaryColor = selectedTheme.theme.primaryColor;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <ShoppingBag className="w-10 h-10" style={{ color: primaryColor }} />
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                            Configure Product Page
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Select which features you want on your product pages. These settings apply to all product pages.
                    </p>
                </motion.div>

                {/* Product Page Structure Options */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
                >
                    {productPageOptions.map((option, index) => {
                        const Icon = option.icon;
                        const isEnabled = productPageStructure[option.key];

                        return (
                            <motion.button
                                key={option.key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleToggle(option.key)}
                                className={`relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-300 ${
                                    isEnabled
                                        ? 'bg-white border-indigo-500 shadow-lg scale-105'
                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                                style={
                                    isEnabled
                                        ? {
                                              boxShadow: `0 0 0 3px ${primaryColor}20`,
                                              borderColor: primaryColor,
                                          }
                                        : {}
                                }
                            >
                                {/* Selected Indicator */}
                                {isEnabled && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Check className="w-4 h-4" />
                                    </motion.div>
                                )}

                                {/* Icon */}
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                                        isEnabled ? 'opacity-100' : 'opacity-40'
                                    }`}
                                    style={{
                                        backgroundColor: isEnabled ? `${primaryColor}15` : '#f3f4f6',
                                    }}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: isEnabled ? primaryColor : '#6b7280' }}
                                    />
                                </div>

                                {/* Label */}
                                <h3
                                    className={`text-base font-bold mb-1 ${
                                        isEnabled ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    {option.label}
                                </h3>

                                {/* Description */}
                                <p
                                    className={`text-xs ${
                                        isEnabled ? 'text-gray-600' : 'text-gray-400'
                                    }`}
                                >
                                    {option.description}
                                </p>

                                {/* Status Badge */}
                                <div className="mt-3">
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                            isEnabled
                                                ? 'text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                        style={
                                            isEnabled
                                                ? { backgroundColor: primaryColor }
                                                : {}
                                        }
                                    >
                                        {isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Continue Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleContinue}
                        className="px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${selectedTheme.theme.secondaryColor || primaryColor})`,
                        }}
                    >
                        <span>Continue to AI Setup</span>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center"
                >
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Essential features are enabled by default. You can enable additional features like variants, related products, and reviews.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

