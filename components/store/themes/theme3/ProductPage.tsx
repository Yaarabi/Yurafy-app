import React from 'react';
import { useStore } from '../../hooks/useStore';
import Header from './sections/Header';
import Footer from './sections/Footer';
import ProductDetails from '../../sections/ProductDetails';
import OrderForm from '../../sections/OrderForm';
import { ArrowLeftIcon } from '../../components/icons';
import { motion } from 'framer-motion';

const ProductPage: React.FC = () => {
    const { goHome, selectedStore } = useStore();

    const primaryColor = selectedStore?.theme?.primaryColor || '#16a34a';
    const secondaryColor = selectedStore?.theme?.secondaryColor || primaryColor;

    return (
        <>
            <Header />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-green-50 min-h-screen"
                style={{ 
                    '--color-primary': primaryColor,
                    '--color-secondary': secondaryColor,
                } as React.CSSProperties}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <button
                        onClick={goHome}
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[var(--color-primary)] mb-8 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Products</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl p-8 border-4" style={{ borderColor: primaryColor }}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full"
                                    style={{ backgroundColor: `${primaryColor}15` }}
                                >
                                    <span className="text-lg">🌱</span>
                                    <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                                        Eco-Friendly
                                    </span>
                                </div>
                                <ProductDetails />
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-2xl shadow-xl p-6 border-4" style={{ borderColor: primaryColor }}>
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
