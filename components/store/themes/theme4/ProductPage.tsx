import React from 'react';
import { useStore } from '../../hooks/useStore';
import { useRouter, useParams } from 'next/navigation';
import Header from './sections/HeaderProductPage';
import Footer from './sections/Footer';
import ProductDetails from '../../sections/ProductDetails';
import OrderForm from '../../sections/OrderForm';
import Trust from './sections/Trust';
import { ArrowLeftIcon } from '../../components/icons';
import { motion } from 'framer-motion';
import ImageDescriptions from '@/components/productPage/ImageDescriptions';
import SpecificationsTable from '@/components/productPage/SpecificationsTable';

const ProductPage: React.FC = () => {
    const { selectedStore, selectedProduct } = useStore();
    const router = useRouter();
    const params = useParams();


    const primaryColor = selectedStore?.theme?.primaryColor || '#4b5563';
    const secondaryColor = selectedStore?.theme?.secondaryColor || primaryColor;

    return (
        <>
            <Header />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white min-h-screen"
                style={{ 
                    '--color-primary': primaryColor,
                    '--color-secondary': secondaryColor,
                } as React.CSSProperties}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
                    <div className="space-y-6 sm:space-y-8">
                        {/* Product Details */}
                        <div>
                            <ProductDetails />
                        </div>
                        {/* Order Form - Below Product Details */}
                        <div id="order-form" className="bg-gray-50 rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
                            <OrderForm />
                        </div>
                        {/* Specifications Table - Below Order Form */}
                        {selectedProduct && (
                                <SpecificationsTable product={selectedProduct} primaryColor={primaryColor} secondaryColor={secondaryColor} />
                        )}
                        {/* Image Descriptions - Below Specifications */}
                        {selectedProduct && (
                                <ImageDescriptions product={selectedProduct} />
                        )}
                    </div>
                    {/* Trust Section */}
                    <div className="mt-8 sm:mt-12 lg:mt-16">
                        <Trust />
                    </div>
                </div>
            </motion.div>
            <Footer />
        </>
    );
};

export default ProductPage;
