import React from 'react';
import { useStore } from '../../hooks/useStore';
import Header from '../../sections/Header';
import Footer from '../../sections/Footer';
import ProductDetails from '../../sections/ProductDetails';
import OrderForm from '../../sections/OrderForm';
import { ArrowLeftIcon } from '../../components/icons';
import { motion } from 'framer-motion';

const ProductPage: React.FC = () => {
    const { goHome, selectedStore } = useStore();

    const primaryColor = selectedStore?.theme?.primaryColor || '#3B82F6';
    const secondaryColor = selectedStore?.theme?.secondaryColor || primaryColor;
    const textColor = selectedStore?.theme?.textColor || '#ffffff';

    return (
        <>
            <Header />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-gray-50 to-white min-h-screen"
                style={{ 
                    '--color-primary': primaryColor,
                    '--color-secondary': secondaryColor,
                    '--color-text': textColor,
                } as React.CSSProperties}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <button
                        onClick={goHome}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] mb-8 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Products</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                        <div className="lg:col-span-2">
                            <ProductDetails />
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                    <OrderForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            <Footer />
        </>
    );
};

export default ProductPage;

