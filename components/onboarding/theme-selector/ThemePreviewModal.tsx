"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { storeThemes } from '@/public/themes';
import { THEME_PREVIEWS } from '@/components/store/constants/themePreviews';
import ColorCustomizationPanel from './ColorCustomizationPanel';

type ThemeConfig = (typeof storeThemes)[number];

type PreviewPage = 'STORE_PAGE' | 'PRODUCT_PAGE' | 'SHOP_PAGE';

type ColorKey = 'primary' | 'secondary' | 'text' | 'surface';

interface ThemePreviewModalProps {
    previewThemeId: number | null;
    previewPage: PreviewPage;
    onClose: () => void;
    onSelectTheme: (themeIndex: number) => void;
    setPreviewPage: (page: PreviewPage) => void;
    showColorPanel: boolean;
    setShowColorPanel: (value: boolean) => void;
    previewPrimaryColor: string;
    previewSecondaryColor: string;
    previewTextColor: string;
    previewSurfaceColor: string;
    setPreviewPrimaryColor: (value: string) => void;
    setPreviewSecondaryColor: (value: string) => void;
    setPreviewTextColor: (value: string) => void;
    setPreviewSurfaceColor: (value: string) => void;
    customPrimaryColor: string;
    customSecondaryColor: string;
    customTextColor: string;
    customSurfaceColor: string;
    setCustomPrimaryColor: (value: string) => void;
    setCustomSecondaryColor: (value: string) => void;
    setCustomTextColor: (value: string) => void;
    setCustomSurfaceColor: (value: string) => void;
    selectedThemeIndex: number | null;
    updatePreviewColor: (type: ColorKey, value: string, isSelected: boolean) => void;
    previewStoreElement: React.ReactNode | null;
    t: (key: string) => string;
}

const ThemePreviewModal: React.FC<ThemePreviewModalProps> = ({
    previewThemeId,
    previewPage,
    onClose,
    onSelectTheme,
    setPreviewPage,
    showColorPanel,
    setShowColorPanel,
    previewPrimaryColor,
    previewSecondaryColor,
    previewTextColor,
    previewSurfaceColor,
    setPreviewPrimaryColor,
    setPreviewSecondaryColor,
    setPreviewTextColor,
    setPreviewSurfaceColor,
    customPrimaryColor,
    customSecondaryColor,
    customTextColor,
    customSurfaceColor,
    setCustomPrimaryColor,
    setCustomSecondaryColor,
    setCustomTextColor,
    setCustomSurfaceColor,
    selectedThemeIndex,
    updatePreviewColor,
    previewStoreElement,
    t,
}) => {
    const previewThemeIndex = previewThemeId ? previewThemeId - 1 : null;
    const currentTheme: ThemeConfig | undefined =
        previewThemeIndex !== null ? storeThemes[previewThemeIndex] : undefined;
    const previewInfo =
        previewThemeId !== null
            ? THEME_PREVIEWS.find((item) => item.themeId === previewThemeId)
            : undefined;

    const isSelectedTheme =
        previewThemeIndex !== null && selectedThemeIndex === previewThemeIndex;

    const resolvedPrimary =
        previewPrimaryColor || (isSelectedTheme && customPrimaryColor) || currentTheme?.theme.primaryColor || '';
    const resolvedSecondary =
        previewSecondaryColor || (isSelectedTheme && customSecondaryColor) || currentTheme?.theme.secondaryColor || '';
    const resolvedText =
        previewTextColor || (isSelectedTheme && customTextColor) || currentTheme?.theme.textColor || '';
    const resolvedSurface =
        previewSurfaceColor || (isSelectedTheme && customSurfaceColor) || currentTheme?.theme.surfaceColor || '';

    const handleSelectTheme = () => {
        if (previewPrimaryColor) setCustomPrimaryColor(previewPrimaryColor);
        if (previewSecondaryColor) setCustomSecondaryColor(previewSecondaryColor);
        if (previewTextColor) setCustomTextColor(previewTextColor);
        if (previewSurfaceColor) setCustomSurfaceColor(previewSurfaceColor);

        if (previewThemeIndex !== null) {
            onSelectTheme(previewThemeIndex);
        }

        setPreviewPrimaryColor('');
        setPreviewSecondaryColor('');
        setPreviewTextColor('');
        setPreviewSurfaceColor('');
        setShowColorPanel(false);
        onClose();
    };

    const handleClose = () => {
        setPreviewPrimaryColor('');
        setPreviewSecondaryColor('');
        setPreviewTextColor('');
        setPreviewSurfaceColor('');
        setShowColorPanel(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {previewThemeId && currentTheme && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(event) => event.stopPropagation()}
                        className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-[90vh] sm:w-[min(1300px,calc(100vw-2rem))] lg:w-[85vw] sm:max-w-[100vw] sm:max-h-[100vh] max-w-full max-h-full overflow-hidden flex flex-col m-0"
                    >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 gap-3 sm:gap-0">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                                {t(`themeNames.${previewThemeId}`) || previewInfo?.name || `Theme ${previewThemeId}`}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                {previewInfo?.description || 'Preview this theme'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setPreviewPage('STORE_PAGE')}
                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation active:scale-95 ${
                                    previewPage === 'STORE_PAGE' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('store')}
                            </button>
                            <button
                                onClick={() => setPreviewPage('SHOP_PAGE')}
                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation active:scale-95 ${
                                    previewPage === 'SHOP_PAGE' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('shop')}
                            </button>
                            <button
                                onClick={() => setPreviewPage('PRODUCT_PAGE')}
                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation active:scale-95 ${
                                    previewPage === 'PRODUCT_PAGE' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('product')}
                            </button>
                            <button
                                onClick={() => setShowColorPanel(!showColorPanel)}
                                className="sm:hidden px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm transition-colors touch-manipulation active:scale-95"
                            >
                                {showColorPanel ? 'Hide' : 'Colors'}
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 touch-manipulation active:scale-95 flex-shrink-0"
                            >
                                <span className="text-xl sm:text-2xl">×</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        <div className="hidden lg:block w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0 p-4 sm:p-6">
                            <ColorCustomizationPanel
                                primaryColor={resolvedPrimary}
                                secondaryColor={resolvedSecondary}
                                textColor={resolvedText}
                                surfaceColor={resolvedSurface}
                                currentTheme={currentTheme}
                                isSelectedTheme={isSelectedTheme}
                                updatePreviewColor={updatePreviewColor}
                                t={t}
                            />
                        </div>

                        <AnimatePresence>
                            {showColorPanel && (
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-bold text-gray-900">{t('customizeColors')}</h4>
                                            <button
                                                onClick={() => setShowColorPanel(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <span className="text-xl">×</span>
                                            </button>
                                        </div>
                                        <ColorCustomizationPanel
                                            primaryColor={resolvedPrimary}
                                            secondaryColor={resolvedSecondary}
                                            textColor={resolvedText}
                                            surfaceColor={resolvedSurface}
                                            currentTheme={currentTheme}
                                            isSelectedTheme={isSelectedTheme}
                                            updatePreviewColor={updatePreviewColor}
                                            t={t}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0 w-full">
                            <div className="flex items-start justify-center p-0 w-full">
                                <div className="w-full">
                                    {previewStoreElement}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                                {previewInfo?.features?.map((feature, idx) => (
                                    <span key={idx} className="text-xs px-2.5 sm:px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={handleSelectTheme}
                                className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
                            >
                                <Check className="w-4 h-4" />
                                {t('selectThisTheme')}
                            </button>
                        </div>
                    </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ThemePreviewModal;
