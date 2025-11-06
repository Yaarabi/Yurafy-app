
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductGalleryProps {
    mainImage: string;
    images?: string[];
    imageDescriptions?: string[];
    alt: string;
}

export default function ProductGallery({ mainImage, images = [], imageDescriptions = [], alt }: ProductGalleryProps) {
    const [selected, setSelected] = useState(mainImage);
    const allImages = [mainImage, ...images];
    const allDescriptions = imageDescriptions ? ['', ...imageDescriptions] : [];

    return (
        <div
        className="flex flex-col gap-4 w-full md:w-1/2"
        style={{ fontFamily: 'var(--font-family, Inter)' }}
        >
        {/* Main Preview */}
        <motion.div
            key={selected}
            className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
            border: '2px solid var(--primary-color)',
            }}
        >
            <Image
            src={selected}
            alt={alt}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            />
            {/* Image Description Overlay */}
            {allDescriptions[allImages.indexOf(selected)] && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 text-sm">
                    {allDescriptions[allImages.indexOf(selected)]}
                </div>
            )}
        </motion.div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.map((img, idx) => (
                <button
                key={idx}
                onClick={() => setSelected(img)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${
                    selected === img
                    ? 'border-[var(--primary-color)]'
                    : 'border-transparent hover:border-[var(--primary-color)/40]'
                }`}
                title={allDescriptions[idx] || `${alt}-${idx}`}
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