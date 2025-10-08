
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductGalleryProps {
    mainImage: string;
    images?: string[];
    alt: string;
}

export default function ProductGallery({ mainImage, images = [], alt }: ProductGalleryProps) {
    const [selected, setSelected] = useState(mainImage);

    const allImages = [mainImage, ...images];

    return (
        <div className="flex flex-col gap-4 w-full md:w-1/2">
        {/* Main Preview */}
        <motion.div
            key={selected}
            className="relative w-full h-96 rounded-2xl overflow-hidden shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Image
            src={selected}
            alt={alt}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            />
        </motion.div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.map((img, idx) => (
                <button
                key={idx}
                onClick={() => setSelected(img)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition 
                    ${selected === img ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                >
                <Image
                    src={img}
                    alt={`${alt}-${idx}`}
                    fill
                    className="object-cover"
                />
                </button>
            ))}
            </div>
        )}
        </div>
    );
}
