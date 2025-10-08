
'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ProductImage({ src, alt }: { src: string; alt: string }) {
    return (
        <motion.div
        className="relative w-full md:w-1/2 h-96 rounded-2xl overflow-hidden shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.03 }}
        >
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
        />
        </motion.div>
    );
}
