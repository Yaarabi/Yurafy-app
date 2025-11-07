'use client';

import { IProduct } from '@/models/products';
import Image from 'next/image';

interface ImageDescriptionsProps {
    product: IProduct;
}

export default function ImageDescriptions({ product }: ImageDescriptionsProps) {
    // Only show if there are description images
    if (!product.descriptionsImage || product.descriptionsImage.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 px-4 sm:px-6">
            <div className="border-t border-gray-200 pt-8">
                <h4 
                    className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center"
                    style={{ color: 'var(--secondary-color)' }}
                >
                    Product Images
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {product.descriptionsImage.map((img, idx) => (
                        <div 
                            key={idx} 
                            className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <Image 
                                src={img} 
                                alt={`${product.name} - Image ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

