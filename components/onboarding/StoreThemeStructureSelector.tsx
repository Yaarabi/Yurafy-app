'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Navigation, Image, Info, Shield, Grid, FileText, Check, ArrowRight } from 'lucide-react';

interface ThemeStructure {
    header: boolean;
    hero: boolean;
    about: boolean;
    trust: boolean;
    productGrid: boolean;
    footer: boolean;
}

interface StoreThemeStructureSelectorProps {
    onSelect: (themeStructure: ThemeStructure) => void;
    selectedTheme: {
        themeId: number;
        theme: { primaryColor: string; secondaryColor?: string; textColor?: string };
    };
}

const structureOptions = [
    {
        key: 'header' as const,
        label: 'Header',
        description: 'Navigation bar with logo and menu',
        icon: Navigation,
        default: true,
    },
    {
        key: 'hero' as const,
        label: 'Hero Section',
        description: 'Main banner with title and call-to-action',
        icon: Image,
        default: true,
    },
    {
        key: 'about' as const,
        label: 'About Section',
        description: 'Information about your business',
        icon: Info,
        default: true,
    },
    {
        key: 'trust' as const,
        label: 'Trust Section',
        description: 'Trust badges and testimonials',
        icon: Shield,
        default: true,
    },
    {
        key: 'productGrid' as const,
        label: 'Product Grid',
        description: 'Display your products',
        icon: Grid,
        default: true,
    },
    {
        key: 'footer' as const,
        label: 'Footer',
        description: 'Contact info and links',
        icon: FileText,
        default: true,
    },
];

export default function StoreThemeStructureSelector({ onSelect, selectedTheme }: StoreThemeStructureSelectorProps) {
    const [themeStructure, setThemeStructure] = useState<ThemeStructure>({
        header: true,
        hero: true,
        about: true,
        trust: true,
        productGrid: true,
        footer: true,
    });

    const handleToggle = (key: keyof ThemeStructure) => {
        setThemeStructure(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleContinue = () => {
        onSelect(themeStructure);
    };

    const primaryColor = selectedTheme.theme.primaryColor;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Layout className="w-10 h-10" style={{ color: primaryColor }} />
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                            Configure Store Structure
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Select which sections you want to display on your store. You can customize this later.
                    </p>
                </motion.div>

                {/* Theme Structure Options */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
                >
                    {structureOptions.map((option, index) => {
                        const Icon = option.icon;
                        const isEnabled = themeStructure[option.key];

                        return (
                            <motion.button
                                key={option.key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleToggle(option.key)}
                                className={`relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-300 ${
                                    isEnabled
                                        ? 'bg-white border-indigo-500 shadow-lg scale-105'
                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                                style={
                                    isEnabled
                                        ? {
                                              boxShadow: `0 0 0 3px ${primaryColor}20`,
                                              borderColor: primaryColor,
                                          }
                                        : {}
                                }
                            >
                                {/* Selected Indicator */}
                                {isEnabled && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Check className="w-4 h-4" />
                                    </motion.div>
                                )}

                                {/* Icon */}
                                <div
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                                        isEnabled ? 'opacity-100' : 'opacity-40'
                                    }`}
                                    style={{
                                        backgroundColor: isEnabled ? `${primaryColor}15` : '#f3f4f6',
                                    }}
                                >
                                    <Icon
                                        className="w-6 h-6"
                                        style={{ color: isEnabled ? primaryColor : '#6b7280' }}
                                    />
                                </div>

                                {/* Label */}
                                <h3
                                    className={`text-lg font-bold mb-2 ${
                                        isEnabled ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    {option.label}
                                </h3>

                                {/* Description */}
                                <p
                                    className={`text-sm ${
                                        isEnabled ? 'text-gray-600' : 'text-gray-400'
                                    }`}
                                >
                                    {option.description}
                                </p>

                                {/* Status Badge */}
                                <div className="mt-4">
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                            isEnabled
                                                ? 'text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                        style={
                                            isEnabled
                                                ? { backgroundColor: primaryColor }
                                                : {}
                                        }
                                    >
                                        {isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Continue Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleContinue}
                        className="px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${selectedTheme.theme.secondaryColor || primaryColor})`,
                        }}
                    >
                        <span>Continue to Setup</span>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center"
                >
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> All sections are enabled by default. You can toggle them on/off based on your needs.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

