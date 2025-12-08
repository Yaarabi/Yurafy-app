import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { useCart } from '../../context/CartContext';
import { useRouter, useParams } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { IProduct } from '@/models/products';
import Header from './sections/HeaderProductPage';
import Footer from './sections/Footer';
import { Sparkles } from 'lucide-react';
import { getStoreTranslation } from '../../utils/translations';
import CategoryFilterBar from './sections/CategoryFilterBar';
import ProductCard from './sections/ProductCard';

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ShopPage: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#ca8a04';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#f8fafc';
    const storeLanguage = selectedStore.language?.split('-')[0]?.toLowerCase() || 'en';

    const categories = useMemo(() => {
        const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
        return Array.from(uniqueCategories);
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!selectedCategory) return products;
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory]);

    const handleViewProduct = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        if (disableNavigation) return;
        const locale = (params as any)?.locale || 'en';
        const domain = (params as any)?.domain || selectedStore.domain;
        const href = `/${locale}/${domain}/shop/${product.slug}`;
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

                    </motion.div>

                    <CategoryFilterBar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onChange={setSelectedCategory}
                        primaryColor={primaryColor}
                        storeLanguage={storeLanguage}
                    />

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
                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 lg:gap-16"
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
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    primaryColor={primaryColor}
                                    storeLanguage={storeLanguage}
                                    disableNavigation={disableNavigation}
                                    onViewProduct={handleViewProduct}
                                    onAddToCart={handleAddToCart}
                                    variants={cardVariants}
                                />
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
