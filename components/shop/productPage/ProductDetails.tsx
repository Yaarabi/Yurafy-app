
'use client';
import { IProduct } from '@/models/products';
import { motion } from 'framer-motion';

export default function ProductDetails({ product }: { product: IProduct }) {
    const finalPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

    return (
        <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } }
        }}
        className="space-y-4"
        >
        <motion.h1 variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {product.name}
        </motion.h1>

        <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="text-gray-600 mt-3 text-lg sm:text-xl">
            {product.description}
        </motion.p>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            {product.discount ? (
            <div className="flex items-center space-x-3">
                <span className="text-gray-400 line-through text-lg">{product.price} MAD</span>
                <span className="text-blue-600 text-2xl font-bold">{finalPrice} MAD</span>
            </div>
            ) : (
            <p className="text-blue-600 text-2xl font-bold">{product.price} MAD</p>
            )}
        </motion.div>
        </motion.div>
    );
}
