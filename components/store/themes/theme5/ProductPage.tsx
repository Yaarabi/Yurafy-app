import React from 'react';
import { useStore } from '../../hooks/useStore';
import { useRouter, useParams } from 'next/navigation';
import Header from './sections/Header';
import Footer from './sections/Footer';
import ProductDetails from '../../sections/ProductDetails';
import OrderForm from '../../sections/OrderForm';
import Trust from './sections/Trust';
import { ArrowLeftIcon } from '../../components/icons';
import { motion } from 'framer-motion';
import ImageDescriptions from '@/components/productPage/ImageDescriptions';

const ProductPage: React.FC = () => {
    const { selectedStore, selectedProduct } = useStore();
    const router = useRouter();
    const params = useParams();

    const primaryColor = selectedStore?.theme?.primaryColor || '#db2777';
    const secondaryColor = selectedStore?.theme?.secondaryColor || primaryColor;

    const handleGoBack = () => {
        // Check if we're using subdomain (e.g., store.yura-saas.com or coutanova.localhost)
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const parts = hostname ? hostname.split('.') : [];
        // Subdomain detection: 
        // - For localhost: subdomain.localhost (e.g., coutanova.localhost)
        // - For production: subdomain.domain.com (e.g., store.yura-saas.com)
        const isLocalhostSubdomain = hostname.includes('localhost') && parts.length > 1 && parts[0] !== 'localhost';
        const isProductionSubdomain = parts.length >= 3 && !hostname.includes('localhost') && !hostname.startsWith('127.0.0.1');
        const isSubdomain = isLocalhostSubdomain || isProductionSubdomain;
        
        if (isSubdomain) {
            // With subdomain: navigate to root
            window.location.href = '/';
            return;
        } else {
            // Without subdomain: navigate to /{locale}/{domain}
            const domain = (params as any)?.domain || selectedStore?.domain || '';
            const locale = (params as any)?.locale || 'en';
            const href = `/${locale}/${domain}`;
            router.push(href);
        }
    };

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
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 relative z-10">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-700 hover:text-[var(--color-primary)] mb-4 sm:mb-8 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Store</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <div className="space-y-6 sm:space-y-8">
                        {/* Product Details */}
                        <div>
                            <ProductDetails />
                        </div>
                        {/* Order Form - Below Product Details */}
                        <div id="order-form" className="bg-white rounded-none shadow-2xl p-4 sm:p-6 lg:p-8 border-4" style={{ borderColor: primaryColor }}>
                            <OrderForm />
                        </div>
                        {/* Image Descriptions - Below Order Form */}
                        {selectedProduct && (
                            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
                                <ImageDescriptions product={selectedProduct} />
                            </div>
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
