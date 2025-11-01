'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { storeThemes } from '@/public/themes';

interface ThemeSelectorProps {
    onThemeSelect: (themeId: number, theme: { primaryColor: string; secondaryColor?: string; textColor?: string }) => void;
}

export default function ThemeSelector({ onThemeSelect }: ThemeSelectorProps) {
    const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);

    const handleSelectTheme = (index: number) => {
        setSelectedThemeIndex(index);
        // Don't call onThemeSelect here - wait for Continue button click
    };

    const handleContinue = () => {
        if (selectedThemeIndex !== null) {
            const themeData = storeThemes[selectedThemeIndex];
            const themeId = selectedThemeIndex + 1; // Themes are 1-indexed
            
            onThemeSelect(themeId, {
                primaryColor: themeData.theme.primaryColor,
                secondaryColor: themeData.theme.secondaryColor,
                textColor: themeData.theme.textColor,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
                            Choose Your Store Theme
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Select a theme that matches your brand identity. You can customize colors later, but we'll use this as a starting point for your store design.
                    </p>
                </motion.div>

                {/* Theme Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {storeThemes.map((theme, index) => {
                        const themeId = index + 1;
                        const isSelected = selectedThemeIndex === index;
                        const hasGradient = theme.theme.gradient;

                        return (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectTheme(index)}
                                className={`relative flex flex-col rounded-xl border-2 p-5 transition-all duration-300 bg-white shadow-lg hover:shadow-xl overflow-hidden ${
                                    isSelected
                                        ? 'border-indigo-500 ring-4 ring-indigo-200 scale-105'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {/* Selected Check Badge */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 right-2 z-10 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg"
                                    >
                                        <Check className="w-4 h-4" />
                                    </motion.div>
                                )}

                                {/* Theme Preview Gradient */}
                                <div
                                    className="h-24 rounded-lg mb-3 relative overflow-hidden"
                                    style={{
                                        background: hasGradient
                                            ? `linear-gradient(135deg, ${theme.theme.gradient?.from}, ${theme.theme.gradient?.via}, ${theme.theme.gradient?.to})`
                                            : `linear-gradient(135deg, ${theme.theme.primaryColor}, ${theme.theme.secondaryColor || theme.theme.primaryColor})`,
                                    }}
                                >
                                    {/* Theme ID Badge */}
                                    <div
                                        className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: theme.theme.primaryColor + '80',
                                        }}
                                    >
                                        #{themeId}
                                    </div>
                                </div>

                                {/* Theme Name */}
                                <h3 className="font-semibold text-gray-800 text-lg mb-2">{theme.name}</h3>

                                {/* Color Swatches */}
                                <div className="flex gap-2 mt-auto">
                                    <div
                                        className="w-8 h-8 rounded border-2 border-gray-200"
                                        style={{ backgroundColor: theme.theme.primaryColor }}
                                        title="Primary"
                                    />
                                    {theme.theme.secondaryColor && (
                                        <div
                                            className="w-8 h-8 rounded border-2 border-gray-200"
                                            style={{ backgroundColor: theme.theme.secondaryColor }}
                                            title="Secondary"
                                        />
                                    )}
                                    <div
                                        className="w-8 h-8 rounded border-2 border-gray-200"
                                        style={{ backgroundColor: theme.theme.textColor }}
                                        title="Text"
                                    />
                                </div>

                                {/* Selected Indicator */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        className="absolute bottom-0 left-0 h-1 bg-indigo-600"
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Continue Button */}
                <AnimatePresence>
                    {selectedThemeIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-12 flex justify-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleContinue}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Continue with {storeThemes[selectedThemeIndex].name}
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    →
                                </motion.span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

