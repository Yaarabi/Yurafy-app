import React from 'react';
import { useStore } from '../../hooks/useStore';
import Header from '../../sections/Header';
import Footer from '../../sections/Footer';
import ProductDetails from '../../sections/ProductDetails';
import OrderForm from '../../sections/OrderForm';
import { ArrowLeftIcon } from '../../components/icons';
import { motion } from 'framer-motion';

const ProductPage: React.FC = () => {
    const { goHome } = useStore();

    return (
        <>
            <Header />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-pink-50"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <button
                        onClick={goHome}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] mb-8 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Products
                    </button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2">
                             <ProductDetails />
                        </div>
                        <div className="lg:col-span-1">
                             <OrderForm />
                        </div>
                    </div>
                </div>
            </motion.div>
            <Footer />
        </>
    );
};

export default ProductPage;