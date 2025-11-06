'use client';

import { IProduct } from '@/models/products';
import Image from 'next/image';

interface ImageDescriptionsProps {
    product: IProduct;
}

export default function ImageDescriptions({ product }: ImageDescriptionsProps) {
    // Only show if there are images with descriptions
    if (!product.images || product.images.length === 0 || !product.imageDescriptions || product.imageDescriptions.length === 0) {
        return null;
    }

    // Filter to only show images that have descriptions
    const imagesWithDescriptions = product.images
        .map((img, idx) => ({
            image: img,
            description: product.imageDescriptions?.[idx],
            index: idx + 1,
        }))
        .filter(item => item.description && item.description.trim() !== '');

    if (imagesWithDescriptions.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 px-4 sm:px-6">
            <div className="border-t border-gray-200 pt-8">
                <h4 
                    className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center"
                    style={{ color: 'var(--secondary-color)' }}
                >
                    Descriptions des images
                </h4>
                <div className="space-y-4 sm:space-y-6">
                    {imagesWithDescriptions.map((item) => (
                        <div 
                            key={item.index} 
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="relative w-full sm:w-24 h-48 sm:h-24 flex-shrink-0 rounded-md overflow-hidden">
                                <Image 
                                    src={item.image} 
                                    alt={`${product.name} - Image ${item.index}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 96px"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">
                                    Image {item.index}
                                </p>
                                <p className="text-sm sm:text-base text-gray-800 leading-relaxed break-words">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

