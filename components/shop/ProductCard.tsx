'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IProduct } from '@/models/products';
import { useParams } from 'next/navigation';

export default function ProductCard({ product, style }: { product: IProduct, style?: React.CSSProperties }) {
    const params = useParams();

    return (
        <Link href={`/${params.locale}/${params.domain}/shop/${product.slug}`} className="group">
        <div
            style={style}
            className="
            bg-white shadow-md rounded-2xl overflow-hidden 
            transition-transform hover:-translate-y-1 hover:shadow-xl hover:ring-2
            hover:ring-[var(--primary-color)/30]
            "
        >
            <div className="relative w-full h-56">
            <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            </div>
            <div className="p-4">
            <h3 className="text-lg font-semibold truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.category}</p>
            <p className="font-bold mt-2 text-[var(--primary-color)]">{product.price} MAD</p>
            </div>
        </div>
        </Link>
    );
}
