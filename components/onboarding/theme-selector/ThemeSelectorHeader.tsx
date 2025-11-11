"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ThemeSelectorHeaderProps {
    title: string;
    subtitle: string;
}

const ThemeSelectorHeader: React.FC<ThemeSelectorHeaderProps> = ({ title, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0"
    >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                {title}
            </h1>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
            {subtitle}
        </p>
    </motion.div>
);

export default ThemeSelectorHeader;
