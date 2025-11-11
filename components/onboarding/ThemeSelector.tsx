'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { storeThemes } from '@/public/themes';
import ThemeGrid from './theme-selector/ThemeGrid';
import ThemePreviewModal from './theme-selector/ThemePreviewModal';
import ThemeSelectorHeader from './theme-selector/ThemeSelectorHeader';
import useThemeSelectorState from './theme-selector/hooks/useThemeSelectorState';

interface ThemeSelectorProps {
    onThemeSelect: (themeId: number, theme: { primaryColor: string; secondaryColor?: string; textColor?: string; surfaceColor?: string }) => void;
}

export default function ThemeSelector({ onThemeSelect }: ThemeSelectorProps) {
    const t = useTranslations('themes');
    const {
        selectedThemeIndex,
        previewThemeId,
        previewPage,
        showColorPanel,
        previewColors,
        customColors,
        selectTheme,
        previewTheme,
        closePreview,
        continueWithTheme,
        setPreviewPage,
        setShowColorPanel,
        updatePreviewColor,
        previewStoreElement,
    } = useThemeSelectorState({ onThemeSelect });

    const selectedTheme = selectedThemeIndex !== null ? storeThemes[selectedThemeIndex] : null;
    const primaryColor = customColors.primary || selectedTheme?.theme.primaryColor;
    const secondaryColor = customColors.secondary || selectedTheme?.theme.secondaryColor || primaryColor;
    const buttonGradient = selectedThemeIndex !== null && primaryColor
        ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor})`
        : undefined;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 pb-24 sm:p-4 sm:pb-4 md:p-6 md:pb-6 lg:p-8 lg:pb-8">
            <div className="max-w-7xl mx-auto w-full">
                <ThemeSelectorHeader title={t('title')} subtitle={t('subtitle')} />

                <ThemeGrid
                    themes={storeThemes}
                    selectedThemeIndex={selectedThemeIndex}
                    previewThemeId={previewThemeId}
                    onSelectTheme={(index) => selectTheme(index)}
                    onPreviewTheme={previewTheme}
                    t={t}
                />

                <AnimatePresence>
                    {selectedThemeIndex !== null && buttonGradient && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="hidden sm:block mt-6 sm:mt-8 md:mt-12 max-w-4xl mx-auto px-2 sm:px-0"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={continueWithTheme}
                                    className="w-full px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
                                    style={{ background: buttonGradient }}
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>
                                        {t('continueWith')} {t(`themeNames.${selectedThemeIndex + 1}`) || selectedTheme?.name}
                                    </span>
                                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.span>
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl safe-area-inset-bottom"
                            >
                                <div className="max-w-7xl mx-auto px-4 py-3">
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={continueWithTheme}
                                        className="w-full px-6 py-3.5 rounded-xl font-semibold text-base text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
                                        style={{ background: buttonGradient }}
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        <span>{t('continue')}</span>
                                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <ThemePreviewModal
                    previewThemeId={previewThemeId}
                    previewPage={previewPage}
                    onClose={closePreview}
                    onSelectTheme={(themeIndex) => selectTheme(themeIndex, true)}
                    setPreviewPage={setPreviewPage}
                    showColorPanel={showColorPanel}
                    setShowColorPanel={setShowColorPanel}
                    previewPrimaryColor={previewColors.primary}
                    previewSecondaryColor={previewColors.secondary}
                    previewTextColor={previewColors.text}
                    previewSurfaceColor={previewColors.surface}
                    setPreviewPrimaryColor={previewColors.setPrimary}
                    setPreviewSecondaryColor={previewColors.setSecondary}
                    setPreviewTextColor={previewColors.setText}
                    setPreviewSurfaceColor={previewColors.setSurface}
                    customPrimaryColor={customColors.primary}
                    customSecondaryColor={customColors.secondary}
                    customTextColor={customColors.text}
                    customSurfaceColor={customColors.surface}
                    setCustomPrimaryColor={customColors.setPrimary}
                    setCustomSecondaryColor={customColors.setSecondary}
                    setCustomTextColor={customColors.setText}
                    setCustomSurfaceColor={customColors.setSurface}
                    selectedThemeIndex={selectedThemeIndex}
                    updatePreviewColor={updatePreviewColor}
                    previewStoreElement={previewStoreElement}
                    t={t}
                />
            </div>
        </div>
    );
}
