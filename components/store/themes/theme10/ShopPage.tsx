import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { useCart } from '../../context/CartContext';
import { useRouter, useParams } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { IProduct } from '@/models/products';
import Header from './sections/Header';
import Footer from './sections/Footer';
import { ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { getStoreTranslation } from '../../utils/translations';

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ShopPage: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#ca8a04';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#f8fafc';
    const storeLanguage = selectedStore.language?.split('-')[0]?.toLowerCase() || 'en';

    const categories = useMemo(() => {
        const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
        return Array.from(uniqueCategories);
    }, [products]);

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
            <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen overflow-hidden" style={{ backgroundColor: surfaceColor }}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 sm:mb-16"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 sm:mb-6"
                            style={{ 
                                backgroundColor: `${primaryColor}10`,
                                borderColor: `${primaryColor}30`,
                            }}
                        >
                            <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                {getStoreTranslation('featured', storeLanguage) || 'Featured'}
                            </span>
                        </motion.div>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 text-gray-900">
                            {getStoreTranslation('shopProducts', storeLanguage)}
                        </h1>
                        
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-1 w-20 sm:w-24 mx-auto rounded-full"
                            style={{ backgroundColor: primaryColor }}
                        />
                        
                        <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                            {getStoreTranslation('browseProducts', storeLanguage)}
                        </p>
                    </motion.div>

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
                                    selectedCategory === 'all' ? 'text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
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
                                        selectedCategory === category ? 'text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                                    }`}
                                    style={selectedCategory === category ? { backgroundColor: primaryColor } : {}}
                                >
                                    {category}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {products.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <p className="text-lg sm:text-xl text-gray-500">
                                {getStoreTranslation('noProducts', storeLanguage) || 'No products available.'}
                            </p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <p className="text-lg sm:text-xl text-gray-500">
                                {getStoreTranslation('noProductsInCategory', storeLanguage)}
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
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
                                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col"
                                >
                                    <div className="relative overflow-hidden h-64 sm:h-72">
                                        <motion.img
                                            src={product.mainImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            whileHover={{ scale: 1.08 }}
                                            transition={{ duration: 0.6 }}
                                        />
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => handleViewProduct(e, product)}
                                                disabled={disableNavigation}
                                                className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ color: primaryColor }}
                                            >
                                                <Eye className="w-5 h-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity text-white"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 sm:p-6 flex-grow flex flex-col">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 flex-grow">
                                            {product.description}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: primaryColor }}>
                                                    ${product.price?.toFixed(2) ?? '0.00'}
                                                </p>
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
