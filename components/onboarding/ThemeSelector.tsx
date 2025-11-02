'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { storeThemes } from '@/public/themes';
import { THEME_PREVIEWS } from '@/components/store/constants/themePreviews';
import { StoreProvider } from '@/components/store/context/StoreContext';
import ThemeRenderer from '@/components/store/themes/ThemeRenderer';
import { SerializedStore } from '@/lib/data/store';

interface ThemeSelectorProps {
    onThemeSelect: (themeId: number, theme: { primaryColor: string; secondaryColor?: string; textColor?: string }) => void;
}

export default function ThemeSelector({ onThemeSelect }: ThemeSelectorProps) {
    const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);
    const [previewThemeId, setPreviewThemeId] = useState<number | null>(null);
    const [previewPage, setPreviewPage] = useState<'STORE_PAGE' | 'PRODUCT_PAGE'>('STORE_PAGE');
    const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('');
    const [customSecondaryColor, setCustomSecondaryColor] = useState<string>('');
    const [customTextColor, setCustomTextColor] = useState<string>('');
    const [previewPrimaryColor, setPreviewPrimaryColor] = useState<string>('');
    const [previewSecondaryColor, setPreviewSecondaryColor] = useState<string>('');
    const [previewTextColor, setPreviewTextColor] = useState<string>('');
    const [scale, setScale] = useState<number>(0.4);
    
    // Debounce refs for smooth color updates
    const colorUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastColorUpdateRef = useRef<{
        primary?: string;
        secondary?: string;
        text?: string;
    }>({});

    // Calculate responsive scale
    useEffect(() => {
        const updateScale = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setScale(0.32);
            } else if (width < 1024) {
                setScale(0.45);
            } else if (width < 1280) {
                setScale(0.55);
            } else {
                setScale(0.65);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Memoize getPreviewStore to prevent unnecessary recalculations
    const getPreviewStore = useCallback((themeId: number): SerializedStore => {
        const preview = THEME_PREVIEWS.find(p => p.themeId === themeId);
        const themeData = storeThemes[themeId - 1];
        const isCurrentPreviewTheme = previewThemeId === themeId;
        
        // Use preview colors if we're previewing this theme and colors are set, otherwise fall back
        const primaryColor = isCurrentPreviewTheme && previewPrimaryColor 
            ? previewPrimaryColor 
            : (selectedThemeIndex !== null && themeId === (selectedThemeIndex + 1) && customPrimaryColor) 
                ? customPrimaryColor 
                : themeData.theme.primaryColor;
                
        const secondaryColor = isCurrentPreviewTheme && previewSecondaryColor 
            ? previewSecondaryColor 
            : (selectedThemeIndex !== null && themeId === (selectedThemeIndex + 1) && customSecondaryColor) 
                ? customSecondaryColor 
                : themeData.theme.secondaryColor;
                
        const textColor = isCurrentPreviewTheme && previewTextColor 
            ? previewTextColor 
            : (selectedThemeIndex !== null && themeId === (selectedThemeIndex + 1) && customTextColor) 
                ? customTextColor 
                : themeData.theme.textColor;
        
        return {
            _id: `preview_${themeId}`,
            owner: 'preview',
            brandName: preview?.preview.brandName || 'Preview Store',
            domain: `preview-${themeId}`,
            description: preview?.description || 'A preview store showcasing the theme design',
            themeId,
            theme: {
                primaryColor,
                secondaryColor,
                textColor,
            },
            themeStructure: {
                header: true,
                hero: true,
                about: true,
                trust: true,
                productGrid: true,
                footer: true,
            },
            hero: preview?.preview.hero || {
                title: 'Welcome to Our Store',
                subtitle: 'Discover amazing products',
                imageUrl: 'https://picsum.photos/seed/preview/800/600',
            },
            about: preview?.preview.about || {
                title: 'About Us',
                description: 'We provide quality products and excellent service.',
            },
            footer: { text: 'All rights reserved.' },
            headerLinks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }, [previewThemeId, previewPrimaryColor, previewSecondaryColor, previewTextColor, selectedThemeIndex, customPrimaryColor, customSecondaryColor, customTextColor]);

    // Optimized color update function with throttling
    const updatePreviewColor = useCallback((type: 'primary' | 'secondary' | 'text', value: string, isSelectedTheme: boolean) => {
        // Update immediately for responsive feel
        if (type === 'primary') {
            setPreviewPrimaryColor(value);
            if (isSelectedTheme) {
                setCustomPrimaryColor(value);
            }
        } else if (type === 'secondary') {
            setPreviewSecondaryColor(value);
            if (isSelectedTheme) {
                setCustomSecondaryColor(value);
            }
        } else if (type === 'text') {
            setPreviewTextColor(value);
            if (isSelectedTheme) {
                setCustomTextColor(value);
            }
        }

        // Clear existing timeout
        if (colorUpdateTimeoutRef.current) {
            clearTimeout(colorUpdateTimeoutRef.current);
        }

        // Store the latest values
        lastColorUpdateRef.current[type] = value;
    }, []);

    // Memoize preview store to avoid recalculating on every render
    // Use requestAnimationFrame batching for color updates
    const previewStoreElement = useMemo(() => {
        if (!previewThemeId) return null;
        
        const previewStore = getPreviewStore(previewThemeId);
        // Use color values in key to ensure updates, but optimize with RAF
        const storeKey = `preview-${previewThemeId}-${previewPage}-${previewStore.theme.primaryColor}-${previewStore.theme.secondaryColor || ''}-${previewStore.theme.textColor}`;
        
        return (
            <StoreProvider 
                key={storeKey}
                stores={[previewStore]} 
                initialStore={previewStore}
            >
                <div 
                    className="w-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        maxWidth: '1600px',
                        margin: '0 auto',
                    }}
                >
                    <ThemeRenderer themeId={previewThemeId} currentPage={previewPage} />
                </div>
            </StoreProvider>
        );
    }, [previewThemeId, previewPage, scale, getPreviewStore]);
    
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (colorUpdateTimeoutRef.current) {
                clearTimeout(colorUpdateTimeoutRef.current);
            }
        };
    }, []);

    const handlePreview = (themeId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewThemeId === themeId) {
            setPreviewThemeId(null);
            // Clear preview colors when closing
            setPreviewPrimaryColor('');
            setPreviewSecondaryColor('');
            setPreviewTextColor('');
        } else {
            setPreviewThemeId(themeId);
            setPreviewPage('STORE_PAGE'); // Reset to store page when opening preview
            // Initialize preview colors with theme defaults or custom colors if selected
            const themeIndex = themeId - 1;
            const isSelected = selectedThemeIndex === themeIndex;
            if (isSelected) {
                setPreviewPrimaryColor(customPrimaryColor || storeThemes[themeIndex].theme.primaryColor);
                setPreviewSecondaryColor(customSecondaryColor || storeThemes[themeIndex].theme.secondaryColor || '');
                setPreviewTextColor(customTextColor || storeThemes[themeIndex].theme.textColor);
            } else {
                setPreviewPrimaryColor(storeThemes[themeIndex].theme.primaryColor);
                setPreviewSecondaryColor(storeThemes[themeIndex].theme.secondaryColor || '');
                setPreviewTextColor(storeThemes[themeIndex].theme.textColor);
            }
        }
    };

    const handleContinue = () => {
        if (selectedThemeIndex !== null) {
            const themeData = storeThemes[selectedThemeIndex];
            const themeId = selectedThemeIndex + 1;
            
            onThemeSelect(themeId, {
                primaryColor: customPrimaryColor || themeData.theme.primaryColor,
                secondaryColor: customSecondaryColor || themeData.theme.secondaryColor,
                textColor: customTextColor || themeData.theme.textColor,
            });
        }
    };

    const handleThemeSelect = (index: number, preserveColors: boolean = false) => {
        setSelectedThemeIndex(index);
        // Reset custom colors when selecting a new theme, unless we're preserving them
        if (!preserveColors) {
            setCustomPrimaryColor('');
            setCustomSecondaryColor('');
            setCustomTextColor('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
                            Choose Your Store Theme
                        </h1>
                    </div>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        Select a theme that matches your brand identity. Preview each theme to see how it looks with sample content. You can customize the primary color after selection.
                    </p>
                </motion.div>

                {/* Theme Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                    {storeThemes.slice(0, 10).map((theme, index) => {
                        const themeId = index + 1;
                        const isSelected = selectedThemeIndex === index;
                        const isPreviewing = previewThemeId === themeId;
                        const preview = THEME_PREVIEWS.find(p => p.themeId === themeId);
                        const hasGradient = theme.theme.gradient;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative flex flex-col rounded-2xl border-2 p-3 sm:p-4 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl overflow-hidden ${
                                    isSelected
                                        ? 'border-indigo-500 ring-4 ring-indigo-200 scale-105 shadow-2xl'
                                        : 'border-gray-200 hover:border-gray-300 hover:scale-[1.02]'
                                }`}
                            >
                                {/* Selected Check Badge */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-3 right-3 z-20 bg-indigo-600 text-white rounded-full p-2 shadow-xl ring-2 ring-white"
                                    >
                                        <Check className="w-5 h-5" />
                                    </motion.div>
                                )}

                                {/* Preview Toggle Button */}
                                <button
                                    onClick={(e) => handlePreview(themeId, e)}
                                    className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md text-gray-700 rounded-xl p-2.5 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
                                    title={isPreviewing ? 'Close Preview' : 'Preview Theme'}
                                >
                                    <Eye className={`w-5 h-5 ${isPreviewing ? 'text-indigo-600' : ''}`} />
                                </button>

                                {/* Theme Preview Gradient - Larger and more visible */}
                                <div
                                    className="h-32 sm:h-40 md:h-44 rounded-xl mb-4 relative overflow-hidden cursor-pointer shadow-md border border-gray-100"
                                    onClick={() => handleThemeSelect(index)}
                                    style={{
                                        background: hasGradient
                                            ? `linear-gradient(135deg, ${theme.theme.gradient?.from}, ${theme.theme.gradient?.via}, ${theme.theme.gradient?.to})`
                                            : `linear-gradient(135deg, ${theme.theme.primaryColor}, ${theme.theme.secondaryColor || theme.theme.primaryColor})`,
                                    }}
                                >
                                    {/* Theme ID Badge */}
                                    <div
                                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-900 text-sm font-bold px-3 py-1.5 rounded-lg shadow-md border border-gray-200"
                                    >
                                        Theme #{themeId}
                                    </div>

                                    {/* Preview Badge */}
                                    {isPreviewing && (
                                        <div className="absolute inset-0 bg-indigo-600/30 backdrop-blur-sm flex items-center justify-center">
                                            <span className="text-white text-sm font-bold bg-indigo-600 px-4 py-2 rounded-full shadow-xl border-2 border-white">
                                                Preview Active
                                            </span>
                                        </div>
                                    )}

                                    {/* Pattern Overlay for better visibility */}
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                                </div>

                                {/* Theme Name & Description */}
                                <div className="mb-3 px-1">
                                    <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2">
                                        {preview?.name || theme.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                                        {preview?.description || 'Modern store design'}
                                    </p>

                                    {/* Features Tags */}
                                    {preview?.features && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {preview.features.slice(0, 2).map((feature, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Color Swatches - Larger and more visible */}
                                <div className="flex items-center gap-3 mt-auto px-1 pb-2">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div
                                            className="w-12 h-12 rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 ring-2 ring-offset-2 ring-opacity-40"
                                            style={{ 
                                                backgroundColor: theme.theme.primaryColor,
                                                borderColor: theme.theme.primaryColor,
                                                boxShadow: `0 0 0 2px ${theme.theme.primaryColor}40, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                                            }}
                                            title="Primary Color"
                                        />
                                        <span className="text-xs font-medium text-gray-600">Primary</span>
                                    </div>
                                    {theme.theme.secondaryColor && (
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div
                                                className="w-12 h-12 rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 ring-2 ring-offset-2 ring-opacity-40"
                                                style={{ 
                                                    backgroundColor: theme.theme.secondaryColor,
                                                    borderColor: theme.theme.secondaryColor,
                                                    boxShadow: `0 0 0 2px ${theme.theme.secondaryColor}40, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                                                }}
                                                title="Secondary Color"
                                            />
                                            <span className="text-xs font-medium text-gray-600">Secondary</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div
                                            className="w-12 h-12 rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 ring-2 ring-offset-2 ring-opacity-40"
                                            style={{ 
                                                backgroundColor: theme.theme.textColor,
                                                borderColor: theme.theme.textColor,
                                                boxShadow: `0 0 0 2px ${theme.theme.textColor}40, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                                            }}
                                            title="Text Color"
                                        />
                                        <span className="text-xs font-medium text-gray-600">Text</span>
                                    </div>
                                </div>

                                {/* Selected Indicator */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        className="absolute bottom-0 left-0 h-1.5 bg-indigo-600 rounded-b-2xl"
                                    />
                                )}
                            </motion.div>
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
                            className="mt-8 sm:mt-12 max-w-4xl mx-auto"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleContinue}
                                className="w-full px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                                style={{
                                    background: `linear-gradient(135deg, ${customPrimaryColor || storeThemes[selectedThemeIndex].theme.primaryColor}, ${customSecondaryColor || storeThemes[selectedThemeIndex].theme.secondaryColor || storeThemes[selectedThemeIndex].theme.primaryColor})`
                                }}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span className="hidden sm:inline">
                                    Continue with {storeThemes[selectedThemeIndex].name}
                                </span>
                                <span className="sm:hidden">Continue</span>
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </motion.span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Theme Preview Modal */}
                <AnimatePresence>
                    {previewThemeId && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setPreviewThemeId(null)}
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col m-4"
                                >
                                    {/* Preview Header */}
                                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                                        <div className="flex-1">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                                {THEME_PREVIEWS.find(p => p.themeId === previewThemeId)?.name || `Theme ${previewThemeId}`}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {THEME_PREVIEWS.find(p => p.themeId === previewThemeId)?.description || 'Preview this theme'}
                                            </p>
                                        </div>
                                        
                                        {/* Page Type Toggle */}
                                        <div className="flex items-center gap-2 mr-4">
                                            <button
                                                onClick={() => setPreviewPage('STORE_PAGE')}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                    previewPage === 'STORE_PAGE'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                Store Page
                                            </button>
                                            <button
                                                onClick={() => setPreviewPage('PRODUCT_PAGE')}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                    previewPage === 'PRODUCT_PAGE'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                Product Page
                                            </button>
                                        </div>
                                        
                                        <button
                                            onClick={() => setPreviewThemeId(null)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                        >
                                            <span className="text-2xl">×</span>
                                        </button>
                                    </div>

                                    {/* Main Content Area - Side by Side Layout */}
                                    <div className="flex-1 flex overflow-hidden">
                                        {/* Color Customization Sidebar */}
                                        {previewThemeId && (() => {
                                            const previewThemeIndex = previewThemeId - 1;
                                            const currentTheme = storeThemes[previewThemeIndex];
                                            const isSelectedTheme = selectedThemeIndex === previewThemeIndex;
                                            
                                            // Use preview colors for real-time updates, fallback to custom or default colors
                                            const primaryColor = previewPrimaryColor || (isSelectedTheme && customPrimaryColor) || currentTheme.theme.primaryColor;
                                            const secondaryColor = previewSecondaryColor || (isSelectedTheme && customSecondaryColor) || currentTheme.theme.secondaryColor;
                                            const textColor = previewTextColor || (isSelectedTheme && customTextColor) || currentTheme.theme.textColor;
                                            
                                            return (
                                                <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0 p-4 sm:p-6">
                                                    <div className="mb-4">
                                                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                                                            Customize Colors
                                                        </h4>
                                                        <p className="text-xs text-gray-600">
                                                            Adjust colors in real-time
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="space-y-6">
                                                        {/* Primary Color */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Primary Color
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="color"
                                                                    value={primaryColor}
                                                                    onChange={(e) => {
                                                                        // Use requestAnimationFrame for smoother updates
                                                                        const value = e.target.value;
                                                                        requestAnimationFrame(() => {
                                                                            updatePreviewColor('primary', value, isSelectedTheme);
                                                                        });
                                                                    }}
                                                                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={primaryColor}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '' || /^#[0-9A-F]{0,6}$/i.test(value)) {
                                                                            // Immediate update for text input with debounce for heavy operations
                                                                            updatePreviewColor('primary', value || currentTheme.theme.primaryColor, isSelectedTheme);
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const value = e.target.value;
                                                                        if (!/^#[0-9A-F]{6}$/i.test(value) && value !== '') {
                                                                            updatePreviewColor('primary', currentTheme.theme.primaryColor, isSelectedTheme);
                                                                        }
                                                                    }}
                                                                    placeholder={currentTheme.theme.primaryColor}
                                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                                                />
                                                            </div>
                                                            <div className="h-10 rounded-lg border border-gray-200 shadow-sm" 
                                                                 style={{ backgroundColor: primaryColor }} 
                                                            />
                                                        </div>

                                                        {/* Secondary Color */}
                                                        {currentTheme.theme.secondaryColor && (
                                                            <div className="flex flex-col gap-2">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Secondary Color
                                                                </label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="color"
                                                                        value={secondaryColor}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            requestAnimationFrame(() => {
                                                                                updatePreviewColor('secondary', value, isSelectedTheme);
                                                                            });
                                                                        }}
                                                                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={secondaryColor}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            if (value === '' || /^#[0-9A-F]{0,6}$/i.test(value)) {
                                                                                updatePreviewColor('secondary', value || currentTheme.theme.secondaryColor || '', isSelectedTheme);
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const value = e.target.value;
                                                                            if (!/^#[0-9A-F]{6}$/i.test(value) && value !== '') {
                                                                                updatePreviewColor('secondary', currentTheme.theme.secondaryColor || '', isSelectedTheme);
                                                                            }
                                                                        }}
                                                                        placeholder={currentTheme.theme.secondaryColor}
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                                                    />
                                                                </div>
                                                                <div className="h-10 rounded-lg border border-gray-200 shadow-sm" 
                                                                     style={{ backgroundColor: secondaryColor }} 
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Text Color */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Text Color
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="color"
                                                                    value={textColor}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        requestAnimationFrame(() => {
                                                                            updatePreviewColor('text', value, isSelectedTheme);
                                                                        });
                                                                    }}
                                                                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={textColor}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '' || /^#[0-9A-F]{0,6}$/i.test(value)) {
                                                                            updatePreviewColor('text', value || currentTheme.theme.textColor, isSelectedTheme);
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const value = e.target.value;
                                                                        if (!/^#[0-9A-F]{6}$/i.test(value) && value !== '') {
                                                                            updatePreviewColor('text', currentTheme.theme.textColor, isSelectedTheme);
                                                                        }
                                                                    }}
                                                                    placeholder={currentTheme.theme.textColor}
                                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                                                />
                                                            </div>
                                                            <div className="h-10 rounded-lg border border-gray-200 shadow-sm" 
                                                                 style={{ backgroundColor: textColor }} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Preview Content - Store Page or Product Page */}
                                        <div className="flex-1 overflow-auto bg-gray-50">
                                            <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
                                                {previewStoreElement}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Footer */}
                                    <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                            <div className="flex gap-2 flex-wrap">
                                                {THEME_PREVIEWS.find(p => p.themeId === previewThemeId)?.features.map((feature, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Save preview colors to custom colors first
                                                    if (previewPrimaryColor) setCustomPrimaryColor(previewPrimaryColor);
                                                    if (previewSecondaryColor) setCustomSecondaryColor(previewSecondaryColor);
                                                    if (previewTextColor) setCustomTextColor(previewTextColor);
                                                    // Select the theme while preserving the colors we just set
                                                    handleThemeSelect(previewThemeId - 1, true);
                                                    setPreviewThemeId(null);
                                                    // Clear preview colors
                                                    setPreviewPrimaryColor('');
                                                    setPreviewSecondaryColor('');
                                                    setPreviewTextColor('');
                                                }}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Select This Theme
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
