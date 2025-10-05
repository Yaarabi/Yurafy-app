'use client';


import ProductGrid from '@/components/shop/ProductGrid';
import { motion } from 'framer-motion';

    const products = [
    {
        _id: '6700a1a1e12f5d0012a12301',
        name: 'Elegant Moroccan Kaftan',
        price: 699,
        category: 'Fashion',
        images: '/logo.png',
        description:
        'Handcrafted Moroccan kaftan made with fine embroidery and silk fabric. Perfect for weddings and celebrations.',
        stock: 15,
    },
    {
        _id: '6700a1a1e12f5d0012a12302',
        name: 'Minimalist Smart Watch',
        price: 499,
        category: 'Electronics',
        images: '/logo.png',
        description:
        'Stay connected with this sleek smartwatch featuring fitness tracking, notifications, and heart rate monitor.',
        stock: 25,
    },
    {
        _id: '6700a1a1e12f5d0012a12303',
        name: 'Wireless Bluetooth Headphones',
        price: 349,
        category: 'Electronics',
        images: '/logo.png',
        description:
        'Noise-cancelling Bluetooth headphones with long battery life and crystal-clear sound.',
        stock: 30,
    },
    {
        _id: '6700a1a1e12f5d0012a12304',
        name: 'Leather Office Bag',
        price: 599,
        category: 'Accessories',
        images: '/logo.png',
        description:
        'Premium leather office bag with laptop compartment and multiple pockets — durable and elegant.',
        stock: 10,
    },
    {
        _id: '6700a1a1e12f5d0012a12305',
        name: 'Handmade Ceramic Vase',
        price: 199,
        category: 'Home Decor',
        images: '/logo.png',
        description:
        'Artisanal ceramic vase crafted by Moroccan artisans, perfect for minimal interior design.',
        stock: 20,
    },
    {
        _id: '6700a1a1e12f5d0012a12306',
        name: 'Classic White Sneakers',
        price: 299,
        category: 'Fashion',
        images: '/logo.png',
        description:
        'Comfortable and stylish white sneakers suitable for any casual outfit.',
        stock: 40,
    },
    {
        _id: '6700a1a1e12f5d0012a12307',
        name: 'AI-Powered LED Desk Lamp',
        price: 279,
        category: 'Home Tech',
        images: '/logo.png',
        description:
        'Smart LED desk lamp with brightness control and AI assistant compatibility.',
        stock: 12,
    },
    {
        _id: '6700a1a1e12f5d0012a12308',
        name: 'Organic Argan Oil 100ml',
        price: 159,
        category: 'Beauty',
        images: '/logo.png',
        description:
        'Pure Moroccan argan oil rich in Vitamin E for hair, skin, and nails care.',
        stock: 50,
    },
    ];

export default function ShopPage() {
    return (
        <main className="relative min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-cyan-50">
        

        <motion.section
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-md">
                Explore Our Collection
            </h1>
            <p className="mt-4 text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
                Discover elegant, AI-powered, and handcrafted products from Yura’s
                marketplace. All orders support cash on delivery.
            </p>
            </div>

            <ProductGrid products={products} />
        </motion.section>

        </main>
    );
}
