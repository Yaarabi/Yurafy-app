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

    const primaryColor = selectedStore?.theme?.primaryColor || '#db2777';
    const secondaryColor = selectedStore?.theme?.secondaryColor || primaryColor;

    return (
        <>
            <Header />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen relative overflow-hidden"
                style={{ 
                    '--color-primary': primaryColor,
                    '--color-secondary': secondaryColor,
                } as React.CSSProperties}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent rounded-full blur-3xl -z-10"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
                    <button
                        onClick={goHome}
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-700 hover:text-[var(--color-primary)] mb-8 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Products</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        <div className="lg:col-span-2">
                            <ProductDetails />
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-none shadow-2xl p-8 border-4" style={{ borderColor: primaryColor }}>
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
