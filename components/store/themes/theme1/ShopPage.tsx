import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { useCart } from '../../context/CartContext';
import { useRouter, useParams } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { IProduct } from '@/models/products';
import Header from './sections/Header';
import Footer from './sections/Footer';
import GeometricDecorations from '../shared/GeometricDecorations';
import { getStoreTranslation } from '../../utils/translations';

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ShopPage: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#0891b2';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#f1f5f9';
    const storeLanguage = selectedStore.language || 'en';

    // Extract unique categories from products
    const categories = useMemo(() => {
        const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
        return Array.from(uniqueCategories);
    }, [products]);

    // Filter products by selected category
    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory]);

    const handleViewProduct = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        if (disableNavigation) return;
        const locale = (params as any)?.locale || 'en';
        const href = `/${locale}/shop/${product.slug}`;
        router.push(href);
    };

    const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        const success = addToCart(product, 1);
        if (success) {
            openCart();
        }
    };

    return (
        <main>
            <Header />
            <div className="relative py-20 min-h-screen overflow-hidden" style={{ backgroundColor: surfaceColor }}>
                {/* Subtle Circuit Pattern */}
                <GeometricDecorations type="circuit" color={primaryColor} className="opacity-5" />
                
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                            {getStoreTranslation('shopProducts', storeLanguage)}
                        </h1>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                            <div className="w-24 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {getStoreTranslation('browseProducts', storeLanguage)}
                        </p>
                    </motion.div>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
                        >
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                                    selectedCategory === 'all'
                                        ? 'text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                                }`}
                                style={selectedCategory === 'all' ? { backgroundColor: primaryColor } : {}}
                            >
                                {getStoreTranslation('allCategories', storeLanguage)}
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                                        selectedCategory === category
                                            ? 'text-white shadow-lg scale-105'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                                    }`}
                                    style={selectedCategory === category ? { backgroundColor: primaryColor } : {}}
                                >
                                    {category}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {products.length === 0 ? (
                        <p className="text-center text-gray-500 text-lg">
                            {getStoreTranslation('noProducts', storeLanguage)}
                        </p>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <p className="text-lg sm:text-xl text-gray-500">
                                {getStoreTranslation('noProductsInCategory', storeLanguage)}
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 },
                                },
                            }}
                        >
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product._id}
                                    variants={cardVariants}
                                    className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border-2 border-transparent hover:border-[var(--color-primary)]"
                                >
                                    {/* Tech Corner Accent */}
                                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10">
                                        <div 
                                            className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] transition-all duration-300 group-hover:border-t-[40px] group-hover:border-l-[40px]"
                                            style={{ borderTopColor: primaryColor }}
                                        ></div>
                                    </div>
                                    
                                    <div className="relative overflow-hidden h-64">
                                        <motion.img
                                            src={product.mainImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                        {/* Tech Overlay with Circuit Pattern */}
                                        <div 
                                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <GeometricDecorations type="circuit" color={primaryColor} className="opacity-30" />
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                {product.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {product.description}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                            <p 
                                                className="text-2xl font-bold mb-3"
                                                style={{ color: primaryColor }}
                                            >
                                                ${product.price?.toFixed(2) ?? '0.00'}
                                            </p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => handleViewProduct(e, product)}
                                                    disabled={disableNavigation}
                                                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    {getStoreTranslation('view', storeLanguage)}
                                                </button>
                                                <button 
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    className="px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-300 hover:scale-105"
                                                    style={{ 
                                                        borderColor: primaryColor,
                                                        color: primaryColor
                                                    }}
                                                >
                                                    {getStoreTranslation('addToCart', storeLanguage)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
};

export default ShopPage;
