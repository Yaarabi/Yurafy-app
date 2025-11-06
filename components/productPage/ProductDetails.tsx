'use client';

import { IProduct } from '@/models/products';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ProductDetailsProps {
    product: IProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const [mainImage, setMainImage] = useState(product.mainImage);

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
        className="space-y-6 container mx-auto px-4 py-8"
        >
        {/* Product Name */}
        <motion.h1
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-sm text-[var(--secondary-color)]"
        >
            {product.name}
        </motion.h1>

        {/* Description */}
        <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="text-lg sm:text-xl leading-relaxed text-gray-700"
        >
            {product.description}
        </motion.p>

        {/* Price */}
        <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
            {product.discount ? (
            <div className="flex items-center gap-3">
                <span className="line-through text-lg">{originalPrice}</span>
                <span
                className="text-2xl font-bold"
                style={{ color: 'var(--primary-color)' }}
                >
                {formattedPrice}
                </span>
            </div>
            ) : (
            <p
                className="text-2xl font-bold"
                style={{ color: 'var(--secondary-color)' }}
            >
                {formattedPrice}
            </p>
            )}
        </motion.div>

        {/* Bundles & Promotions - Only show if bundles exist and are enabled */}
        {product.bundles && product.bundles.enabled === true && (
            <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="p-4 rounded-lg border-2"
                style={{ 
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(var(--primary-color-rgb, 14, 165, 233), 0.1)'
                }}
            >
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
                    Special Offer! 🎉
                </h3>
                {product.bundles.type === 'buy_x_get_y' && product.bundles.buyQuantity && product.bundles.getQuantity && (
                    <p className="text-base text-gray-700">
                        Buy {product.bundles.buyQuantity} Get {product.bundles.getQuantity} Free!
                    </p>
                )}
                {product.bundles.type === 'special_price' && product.bundles.specialPrice && (
                    <p className="text-base text-gray-700">
                        Special Bundle Price: {new Intl.NumberFormat('fr-MA', {
                            style: 'currency',
                            currency: 'MAD',
                        }).format(product.bundles.specialPrice)}
                    </p>
                )}
                {product.bundles.type === 'percentage_off' && product.bundles.percentageOff && (
                    <p className="text-base text-gray-700">
                        {product.bundles.percentageOff}% Off on Bundles!
                    </p>
                )}
            </motion.div>
        )}
        </motion.div>
    );
    }
