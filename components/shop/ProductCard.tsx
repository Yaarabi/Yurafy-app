'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    images: string;
    description: string;
    stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <Link href={`/shop/${product._id}`} className="group">
        <div className="bg-white shadow-md rounded-2xl overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-blue-400/30">
            <div className="relative w-full h-56">
            <Image
                src={product.images}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            </div>
            <div className="p-4">
            <h3 className="text-lg font-semibold truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.category}</p>
            <p className="text-blue-600 font-bold mt-2">{product.price} MAD</p>
            </div>
        </div>
        </Link>
    );
}
