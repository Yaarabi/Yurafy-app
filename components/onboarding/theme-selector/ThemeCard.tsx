"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Eye } from 'lucide-react';
import type { storeThemes } from '@/public/themes';

type ThemeConfig = (typeof storeThemes)[number];

interface ThemePreviewInfo {
    name?: string;
    description?: string;
    features?: string[];
}

interface ThemeCardProps {
    theme: ThemeConfig;
    themeId: number;
    index: number;
    isSelected: boolean;
    isPreviewing: boolean;
    preview?: ThemePreviewInfo;
    onSelect: () => void;
    onPreview: (event: React.MouseEvent<HTMLButtonElement>) => void;
    t: (key: string) => string;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
    theme,
    themeId,
    index,
    isSelected,
    isPreviewing,
    preview,
    onSelect,
    onPreview,
    t,
}) => {
    const hasGradient = Boolean(theme.theme.gradient);
    const previewFeatures = preview?.features ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative flex flex-col rounded-xl sm:rounded-2xl border-2 p-2 sm:p-3 md:p-4 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl overflow-hidden w-full ${
                isSelected
                    ? 'border-indigo-500 ring-2 sm:ring-4 ring-indigo-200 sm:scale-105 shadow-2xl'
                    : 'border-gray-200 hover:border-gray-300 sm:hover:scale-[1.02]'
            }`}
        >
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-indigo-600 text-white rounded-full p-1.5 sm:p-2 shadow-xl ring-2 ring-white"
                >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
            )}

            <button
                onClick={onPreview}
                className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-white/95 backdrop-blur-md text-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-2.5 hover:bg-white active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation"
                title={isPreviewing ? t('closePreview') : t('previewTheme')}
            >
                <Eye className={`w-4 h-4 sm:w-5 sm:h-5 ${isPreviewing ? 'text-indigo-600' : ''}`} />
            </button>

            <div
                className="h-48 sm:h-40 md:h-44 rounded-lg sm:rounded-xl mb-3 sm:mb-4 relative overflow-hidden cursor-pointer shadow-md border border-gray-100 bg-white touch-manipulation active:scale-[0.98] transition-transform w-full"
                onClick={onSelect}
            >
                <div className="absolute top-2 right-2 z-20">
                    <div
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 shadow-lg ring-1 ring-white/40 backdrop-blur-sm transition-transform duration-200 ${
                            isSelected ? 'scale-105' : 'scale-100'
                        }`}
                        style={{
                            background: `linear-gradient(135deg, ${theme.theme.primaryColor}, ${theme.theme.secondaryColor || theme.theme.primaryColor})`,
                        }}
                    >
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">Theme</span>
                        <span className="text-sm font-bold text-white leading-none">#{themeId}</span>
                    </div>
                </div>

                {isPreviewing && (
                    <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="text-white text-xs font-bold bg-indigo-600 px-3 py-1.5 rounded-full shadow-xl border-2 border-white">
                            {t('previewActive')}
                        </span>
                    </div>
                )}

                <div className="w-full h-full p-2 flex flex-col gap-1 pointer-events-none relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.theme.primaryColor} 0%, transparent 50%),
                                             radial-gradient(circle at 80% 50%, ${theme.theme.secondaryColor || theme.theme.primaryColor} 0%, transparent 50%)`,
                        }}
                    />

                    <div
                        className="h-3 rounded-sm flex items-center justify-between px-1 relative z-10"
                        style={{ backgroundColor: theme.theme.primaryColor }}
                    >
                        <div className="w-8 h-1.5 rounded bg-white/30" />
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-white/40" />
                            <div className="w-1 h-1 rounded-full bg-white/40" />
                            <div className="w-1 h-1 rounded-full bg-white/40" />
                        </div>
                    </div>

                    <div
                        className="flex-1 rounded-sm relative overflow-hidden"
                        style={{
                            background: hasGradient
                                ? `linear-gradient(135deg, ${theme.theme.gradient?.from || theme.theme.primaryColor}, ${theme.theme.gradient?.via || theme.theme.secondaryColor || theme.theme.primaryColor}, ${theme.theme.gradient?.to || theme.theme.secondaryColor || theme.theme.primaryColor})`
                                : `linear-gradient(135deg, ${theme.theme.primaryColor}, ${theme.theme.secondaryColor || theme.theme.primaryColor})`,
                        }}
                    >
                        {theme.category && (
                            <div className="absolute top-1 left-1 z-10">
                                <div
                                    className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight backdrop-blur-sm border"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    }}
                                >
                                    {theme.category.split(' / ')[0].split(' & ')[0]}
                                </div>
                            </div>
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 z-10">
                            <div className="w-12 h-1.5 rounded bg-white/40 mb-1" />
                            <div className="w-16 h-1 rounded bg-white/30" />
                        </div>

                        <div className="absolute inset-0 opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <line x1="0" y1="0" x2="100" y2="100" stroke="white" strokeWidth="0.5" />
                                <line x1="100" y1="0" x2="0" y2="100" stroke="white" strokeWidth="0.5" />
                                <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-1 h-6 relative z-10">
                        {[0, 1, 2].map((item) => (
                            <div
                                key={item}
                                className="flex-1 rounded-sm bg-white border relative overflow-hidden"
                                style={{ borderColor: `${theme.theme.primaryColor}30` }}
                            >
                                <div className="h-3 bg-gray-100 rounded-t-sm" />
                                <div className="h-2 px-1 pt-0.5">
                                    <div className="h-1 bg-gray-200 rounded w-3/4" />
                                </div>
                                <div
                                    className="absolute top-0 right-0 w-2 h-2"
                                    style={{
                                        borderTop: `2px solid ${theme.theme.primaryColor}`,
                                        borderRight: `2px solid ${theme.theme.primaryColor}`,
                                        borderTopRightRadius: '0.125rem',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="mb-3 px-1 sm:px-2">
                {theme.category && (
                    <div className="mb-2">
                        <span
                            className="inline-block text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold uppercase tracking-wide"
                            style={{
                                backgroundColor: `${theme.theme.primaryColor}15`,
                                color: theme.theme.primaryColor,
                                border: `1px solid ${theme.theme.primaryColor}30`,
                            }}
                        >
                            {theme.category}
                        </span>
                    </div>
                )}

                <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2">
                    {t(`themeNames.${themeId}`) || preview?.name || theme.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                    {preview?.description || (theme.category ? `Perfect for ${theme.category.toLowerCase()}` : 'Modern store design')}
                </p>

                {previewFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        {previewFeatures.slice(0, 2).map((feature, idx) => (
                            <span
                                key={idx}
                                className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mt-auto px-1 sm:px-2 pb-2 sm:pb-3">
                {['primaryColor', 'secondaryColor', 'textColor'].map((colorKey) => {
                    const colorValue =
                        colorKey === 'primaryColor'
                            ? theme.theme.primaryColor
                            : colorKey === 'secondaryColor'
                                ? theme.theme.secondaryColor
                                : theme.theme.textColor;

                    if (colorKey === 'secondaryColor' && !colorValue) {
                        return null;
                    }

                    return (
                        <div key={colorKey} className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <div
                                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 ring-1 sm:ring-2 ring-offset-1 sm:ring-offset-2 ring-opacity-40"
                                style={{
                                    backgroundColor: colorValue,
                                    borderColor: colorValue,
                                    boxShadow: `0 0 0 1px ${colorValue}40, 0 2px 4px -1px rgba(0, 0, 0, 0.1)`,
                                }}
                                title={t(colorKey)}
                            />
                            <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-600 hidden sm:inline">
                                {t(colorKey)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {isSelected && (
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="absolute bottom-0 left-0 h-1.5 bg-indigo-600 rounded-b-2xl" />
            )}
        </motion.div>
    );
};

export default ThemeCard;
