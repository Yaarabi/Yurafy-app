import React from 'react';
import { useStore } from '../hooks/useStore';
import type { SerializedStore } from '@/lib/data/products';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

const StoreSelection: React.FC = () => {
    const { stores, selectStore } = useStore();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
            >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2">Welcome to Modular Storefront</h1>
                <p className="text-lg text-gray-600">Please select a store to begin shopping.</p>
            </motion.div>
            <motion.div
                className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {stores.map((store: SerializedStore) => (
                    <motion.button
                        key={store._id}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        onClick={() => selectStore(store._id)}
                        className="group relative flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 ease-in-out overflow-hidden"
                        style={{'--store-color': store.theme?.primaryColor ?? '#00A86B'} as React.CSSProperties}
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--store-color)]"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{store.brandName}</h2>
                        <p className="text-gray-500">{store.hero?.title}</p>
                        <div className="absolute bottom-0 right-0 h-12 w-12 bg-[var(--store-color)] opacity-10 rounded-tl-full"></div>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default StoreSelection;