'use client';
import { IProduct } from '@/models/products';
import { motion } from 'framer-motion';

export default function ProductDetails({ product }: { product: IProduct }) {
    const finalPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

    const formattedPrice = new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
    }).format(finalPrice);

    const originalPrice = new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
    }).format(product.price);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-4"
        >
            <motion.h1
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="text-3xl sm:text-4xl font-extrabold"
                style={{ color: 'var(--text-color)' }}
            >
                {product.name}
            </motion.h1>

            <motion.p
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="mt-2 text-lg sm:text-xl"
                style={{ color: 'var(--text-color)' }}
            >
                {product.description}
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-3">
                {product.discount ? (
                    <div className="flex items-center gap-3">
                        <span className="line-through text-lg" style={{ color: 'var(--text-color)' }}>
                            {originalPrice}
                        </span>
                        <span className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                            {formattedPrice}
                        </span>
                    </div>
                ) : (
                    <p className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                        {formattedPrice}
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
}
