'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { storeThemes } from '@/public/themes';
import { THEME_PREVIEWS } from '@/components/store/constants/themePreviews';
import { StoreProvider } from '@/components/store/context/StoreContext';
import { useStore } from '@/components/store/hooks/useStore';
import ThemeRenderer from '@/components/store/themes/ThemeRenderer';
import { SerializedStore } from '@/lib/data/store';
import { FAKE_PRODUCTS } from '@/components/store/constants/data';

interface ThemeSelectorProps {
    onThemeSelect: (themeId: number, theme: { primaryColor: string; secondaryColor?: string; textColor?: string }) => void;
}

// Color Customization Panel Component
const ColorCustomizationPanel = ({
    primaryColor,
    secondaryColor,
    textColor,
    currentTheme,
    isSelectedTheme,
    updatePreviewColor,
    t
}: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    currentTheme: any;
    isSelectedTheme: boolean;
    updatePreviewColor: (type: 'primary' | 'secondary' | 'text', value: string, isSelectedTheme: boolean) => void;
    t: any;
}) => (
    <>
        <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
                {t('customizeColors')}
            </h4>
            <p className="text-xs text-gray-600">
                {t('adjustColors')}
            </p>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
            {/* Primary Color */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    {t('primaryColor')}
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                            const value = e.target.value;
                            requestAnimationFrame(() => {
                                updatePreviewColor('primary', value, isSelectedTheme);
                            });
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation"
                    />
                    <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^#[0-9A-F]{0,6}$/i.test(value)) {
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
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                </div>
                <div className="h-10 sm:h-12 rounded-lg border border-gray-200 shadow-sm" 
                     style={{ backgroundColor: primaryColor }} 
                />
            </div>

            {/* Secondary Color */}
            {currentTheme.theme.secondaryColor && (
                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('secondaryColor')}
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
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation"
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
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div className="h-10 sm:h-12 rounded-lg border border-gray-200 shadow-sm" 
                         style={{ backgroundColor: secondaryColor }} 
                    />
                </div>
            )}

            {/* Text Color */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                    {t('textColor')}
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
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation"
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
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                </div>
                <div className="h-10 sm:h-12 rounded-lg border border-gray-200 shadow-sm" 
                     style={{ backgroundColor: textColor }} 
                />
            </div>
        </div>
    </>
);

export default function ThemeSelector({ onThemeSelect }: ThemeSelectorProps) {
    const t = useTranslations('themes');
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
    const [showColorPanel, setShowColorPanel] = useState<boolean>(false);
    
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

    // Find the demo product with bundles and image descriptions for product page preview
    const demoProduct = FAKE_PRODUCTS.find(p => p._id === 'product_preview_demo') || FAKE_PRODUCTS[0];

    // Component to auto-select product when viewing product page
    const ProductPageAutoSelect: React.FC<{ product: typeof demoProduct; currentPage: 'STORE_PAGE' | 'PRODUCT_PAGE' }> = ({ product, currentPage }) => {
        const { selectProduct, goHome } = useStore();
        useEffect(() => {
            if (currentPage === 'PRODUCT_PAGE' && product) {
                selectProduct(product);
            } else if (currentPage === 'STORE_PAGE') {
                goHome(); // Clear product selection when viewing store page
            }
        }, [currentPage, product, selectProduct, goHome]);
        return null;
    };

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
                products={FAKE_PRODUCTS}
            >
                <ProductPageAutoSelect product={demoProduct} currentPage={previewPage} />
                <div 
                    className="w-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: '100%',
                        maxWidth: '100%',
                        margin: '0 auto',
                    }}
                >
                    <ThemeRenderer themeId={previewThemeId} currentPage={previewPage} />
                </div>
            </StoreProvider>
        );
    }, [previewThemeId, previewPage, scale, getPreviewStore, demoProduct]);
    
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0"
                >
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-indigo-600" />
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                            {t('title')}
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Theme Grid - Mobile Optimized */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full"
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
                                className={`relative flex flex-col rounded-xl sm:rounded-2xl border-2 p-2 sm:p-3 md:p-4 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl overflow-hidden w-full ${
                                    isSelected
                                        ? 'border-indigo-500 ring-2 sm:ring-4 ring-indigo-200 sm:scale-105 shadow-2xl'
                                        : 'border-gray-200 hover:border-gray-300 sm:hover:scale-[1.02]'
                                }`}
                            >
                                {/* Selected Check Badge */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-indigo-600 text-white rounded-full p-1.5 sm:p-2 shadow-xl ring-2 ring-white"
                                    >
                                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </motion.div>
                                )}

                                {/* Preview Toggle Button */}
                                <button
                                    onClick={(e) => handlePreview(themeId, e)}
                                    className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-white/95 backdrop-blur-md text-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-2.5 hover:bg-white active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation"
                                    title={isPreviewing ? t('closePreview') : t('previewTheme')}
                                >
                                    <Eye className={`w-4 h-4 sm:w-5 sm:h-5 ${isPreviewing ? 'text-indigo-600' : ''}`} />
                                </button>

                                {/* Theme UI Preview - Shows simplified store UI preview */}
                                <div
                                    className="h-36 sm:h-40 md:h-44 rounded-lg sm:rounded-xl mb-3 sm:mb-4 relative overflow-hidden cursor-pointer shadow-md border border-gray-100 bg-white touch-manipulation active:scale-[0.98] transition-transform w-full"
                                    onClick={() => handleThemeSelect(index)}
                                >
                                    {/* Theme ID Badge */}
                                    <div
                                        className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-md border border-gray-200"
                                    >
                                        #{themeId}
                                    </div>

                                    {/* Preview Badge */}
                                    {isPreviewing && (
                                        <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center z-10">
                                            <span className="text-white text-xs font-bold bg-indigo-600 px-3 py-1.5 rounded-full shadow-xl border-2 border-white">
                                                {t('previewActive')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Simplified Theme UI Preview with Category-Specific Styling */}
                                    <div className="w-full h-full p-2 flex flex-col gap-1 pointer-events-none relative overflow-hidden">
                                        {/* Geometric Pattern Overlay (subtle) */}
                                        <div 
                                            className="absolute inset-0 opacity-5"
                                            style={{ 
                                                backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.theme.primaryColor} 0%, transparent 50%),
                                                                 radial-gradient(circle at 80% 50%, ${theme.theme.secondaryColor || theme.theme.primaryColor} 0%, transparent 50%)`,
                                            }}
                                        />
                                        
                                        {/* Header Bar */}
                                        <div 
                                            className="h-3 rounded-sm flex items-center justify-between px-1 relative z-10"
                                            style={{ backgroundColor: theme.theme.primaryColor }}
                                        >
                                            <div className="w-8 h-1.5 rounded bg-white/30"></div>
                                            <div className="flex gap-0.5">
                                                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                            </div>
                                        </div>
                                        
                                        {/* Hero Section Preview with Enhanced Styling */}
                                        <div 
                                            className="flex-1 rounded-sm relative overflow-hidden"
                                            style={{ 
                                                background: hasGradient
                                                    ? `linear-gradient(135deg, ${theme.theme.gradient?.from || theme.theme.primaryColor}, ${theme.theme.gradient?.via || theme.theme.secondaryColor || theme.theme.primaryColor}, ${theme.theme.gradient?.to || theme.theme.secondaryColor || theme.theme.primaryColor})`
                                                    : `linear-gradient(135deg, ${theme.theme.primaryColor}, ${theme.theme.secondaryColor || theme.theme.primaryColor})`
                                            }}
                                        >
                                            {/* Category Badge in Preview */}
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
                                            
                                            {/* Hero Content Placeholder */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 z-10">
                                                <div className="w-12 h-1.5 rounded bg-white/40 mb-1"></div>
                                                <div className="w-16 h-1 rounded bg-white/30"></div>
                                            </div>
                                            
                                            {/* Subtle Geometric Pattern */}
                                            <div className="absolute inset-0 opacity-10">
                                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <line x1="0" y1="0" x2="100" y2="100" stroke="white" strokeWidth="0.5" />
                                                    <line x1="100" y1="0" x2="0" y2="100" stroke="white" strokeWidth="0.5" />
                                                    <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5" />
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        {/* Product Cards Preview with Enhanced Styling */}
                                        <div className="flex gap-1 h-6 relative z-10">
                                            <div 
                                                className="flex-1 rounded-sm bg-white border relative overflow-hidden"
                                                style={{ borderColor: `${theme.theme.primaryColor}30` }}
                                            >
                                                <div className="h-3 bg-gray-100 rounded-t-sm"></div>
                                                <div className="h-2 px-1 pt-0.5">
                                                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                                {/* Corner accent */}
                                                <div 
                                                    className="absolute top-0 right-0 w-2 h-2"
                                                    style={{ 
                                                        borderTop: `2px solid ${theme.theme.primaryColor}`,
                                                        borderRight: `2px solid ${theme.theme.primaryColor}`,
                                                        borderTopRightRadius: '0.125rem',
                                                    }}
                                                />
                                            </div>
                                            <div 
                                                className="flex-1 rounded-sm bg-white border relative overflow-hidden"
                                                style={{ borderColor: `${theme.theme.primaryColor}30` }}
                                            >
                                                <div className="h-3 bg-gray-100 rounded-t-sm"></div>
                                                <div className="h-2 px-1 pt-0.5">
                                                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                                {/* Corner accent */}
                                                <div 
                                                    className="absolute top-0 right-0 w-2 h-2"
                                                    style={{ 
                                                        borderTop: `2px solid ${theme.theme.primaryColor}`,
                                                        borderRight: `2px solid ${theme.theme.primaryColor}`,
                                                        borderTopRightRadius: '0.125rem',
                                                    }}
                                                />
                                            </div>
                                            <div 
                                                className="flex-1 rounded-sm bg-white border relative overflow-hidden"
                                                style={{ borderColor: `${theme.theme.primaryColor}30` }}
                                            >
                                                <div className="h-3 bg-gray-100 rounded-t-sm"></div>
                                                <div className="h-2 px-1 pt-0.5">
                                                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                                {/* Corner accent */}
                                                <div 
                                                    className="absolute top-0 right-0 w-2 h-2"
                                                    style={{ 
                                                        borderTop: `2px solid ${theme.theme.primaryColor}`,
                                                        borderRight: `2px solid ${theme.theme.primaryColor}`,
                                                        borderTopRightRadius: '0.125rem',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Overlay gradient for better visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                                </div>

                                {/* Theme Name & Description */}
                                <div className="mb-3 px-1 sm:px-2">
                                    {/* Category Badge */}
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

                                    {/* Features Tags */}
                                    {preview?.features && (
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                            {preview.features.slice(0, 2).map((feature, idx) => (
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

                                {/* Color Swatches - Mobile Optimized */}
                                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mt-auto px-1 sm:px-2 pb-2 sm:pb-3">
                                    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                        <div
                                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 ring-1 sm:ring-2 ring-offset-1 sm:ring-offset-2 ring-opacity-40"
                                            style={{ 
                                                backgroundColor: theme.theme.primaryColor,
                                                borderColor: theme.theme.primaryColor,
                                                boxShadow: `0 0 0 1px ${theme.theme.primaryColor}40, 0 2px 4px -1px rgba(0, 0, 0, 0.1)`,
                                            }}
                                            title={t('primaryColor')}
                                        />
                                        <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-600 hidden sm:inline">{t('primaryColor')}</span>
                                    </div>
                                    {theme.theme.secondaryColor && (
                                        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                            <div
                                                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 ring-1 sm:ring-2 ring-offset-1 sm:ring-offset-2 ring-opacity-40"
                                                style={{ 
                                                    backgroundColor: theme.theme.secondaryColor,
                                                    borderColor: theme.theme.secondaryColor,
                                                    boxShadow: `0 0 0 1px ${theme.theme.secondaryColor}40, 0 2px 4px -1px rgba(0, 0, 0, 0.1)`,
                                                }}
                                                title={t('secondaryColor')}
                                            />
                                            <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-600 hidden sm:inline">{t('secondaryColor')}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                        <div
                                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 ring-1 sm:ring-2 ring-offset-1 sm:ring-offset-2 ring-opacity-40"
                                            style={{ 
                                                backgroundColor: theme.theme.textColor,
                                                borderColor: theme.theme.textColor,
                                                boxShadow: `0 0 0 1px ${theme.theme.textColor}40, 0 2px 4px -1px rgba(0, 0, 0, 0.1)`,
                                            }}
                                            title={t('textColor')}
                                        />
                                        <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-gray-600 hidden sm:inline">{t('textColor')}</span>
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
                            className="mt-6 sm:mt-8 md:mt-12 max-w-4xl mx-auto px-2 sm:px-0"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleContinue}
                                className="w-full px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
                                style={{
                                    background: `linear-gradient(135deg, ${customPrimaryColor || storeThemes[selectedThemeIndex].theme.primaryColor}, ${customSecondaryColor || storeThemes[selectedThemeIndex].theme.secondaryColor || storeThemes[selectedThemeIndex].theme.primaryColor})`
                                }}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span className="hidden sm:inline">
                                    {t('continueWith')} {t(`themeNames.${selectedThemeIndex + 1}`) || storeThemes[selectedThemeIndex].name}
                                </span>
                                <span className="sm:hidden">{t('continue')}</span>
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
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
                            >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:w-auto sm:h-auto sm:max-w-[100vw] sm:max-h-[100vh] max-w-full max-h-full overflow-hidden flex flex-col m-0"
                            >
                                    {/* Preview Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 gap-3 sm:gap-0">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                                                {t(`themeNames.${previewThemeId}`) || THEME_PREVIEWS.find(p => p.themeId === previewThemeId)?.name || `Theme ${previewThemeId}`}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                                {THEME_PREVIEWS.find(p => p.themeId === previewThemeId)?.description || 'Preview this theme'}
                                            </p>
                                        </div>
                                        
                                        {/* Page Type Toggle - Mobile optimized */}
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => setPreviewPage('STORE_PAGE')}
                                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation active:scale-95 ${
                                                    previewPage === 'STORE_PAGE'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {t('store')}
                                            </button>
                                            <button
                                                onClick={() => setPreviewPage('PRODUCT_PAGE')}
                                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation active:scale-95 ${
                                                    previewPage === 'PRODUCT_PAGE'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                                                onClick={() => setPreviewThemeId(null)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 touch-manipulation active:scale-95 flex-shrink-0"
                                            >
                                                <span className="text-xl sm:text-2xl">×</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Main Content Area - Responsive Layout */}
                                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                        {/* Color Customization Sidebar - Hidden on mobile, shown as bottom sheet */}
                                        {previewThemeId && (() => {
                                            const previewThemeIndex = previewThemeId - 1;
                                            const currentTheme = storeThemes[previewThemeIndex];
                                            const isSelectedTheme = selectedThemeIndex === previewThemeIndex;
                                            
                                            // Use preview colors for real-time updates, fallback to custom or default colors
                                            const primaryColor = previewPrimaryColor || (isSelectedTheme && customPrimaryColor) || currentTheme.theme.primaryColor;
                                            const secondaryColor = previewSecondaryColor || (isSelectedTheme && customSecondaryColor) || currentTheme.theme.secondaryColor;
                                            const textColor = previewTextColor || (isSelectedTheme && customTextColor) || currentTheme.theme.textColor;
                                            
                                            return (
                                                <>
                                                    {/* Desktop Sidebar */}
                                                    <div className="hidden lg:block w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0 p-4 sm:p-6">
                                                        <ColorCustomizationPanel
                                                            primaryColor={primaryColor}
                                                            secondaryColor={secondaryColor}
                                                            textColor={textColor}
                                                            currentTheme={currentTheme}
                                                            isSelectedTheme={isSelectedTheme}
                                                            updatePreviewColor={updatePreviewColor}
                                                            t={t}
                                                        />
                                                    </div>
                                                    
                                                    {/* Mobile Bottom Sheet */}
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
                                                                        <h4 className="text-lg font-bold text-gray-900">
                                                                            {t('customizeColors')}
                                                                        </h4>
                                                                        <button
                                                                            onClick={() => setShowColorPanel(false)}
                                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                        >
                                                                            <span className="text-xl">×</span>
                                                                        </button>
                                                                    </div>
                                                                    <ColorCustomizationPanel
                                                                        primaryColor={primaryColor}
                                                                        secondaryColor={secondaryColor}
                                                                        textColor={textColor}
                                                                        currentTheme={currentTheme}
                                                                        isSelectedTheme={isSelectedTheme}
                                                                        updatePreviewColor={updatePreviewColor}
                                                                        t={t}
                                                                    />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            );
                                        })()}

                                        {/* Preview Content - Store Page or Product Page - Full Width */}
                                        <div className="flex-1 overflow-auto bg-gray-50 min-h-0 w-full">
                                            <div className="min-h-full flex items-start justify-center p-0 sm:p-2 md:p-4 lg:p-6 w-full">
                                                <div className="w-full max-w-full h-full">
                                                    {previewStoreElement}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Footer */}
                                    <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                                                {THEME_PREVIEWS.find(p => p.themeId === previewThemeId)?.features.map((feature, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2.5 sm:px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700"
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
                                                    setShowColorPanel(false);
                                                    // Clear preview colors
                                                    setPreviewPrimaryColor('');
                                                    setPreviewSecondaryColor('');
                                                    setPreviewTextColor('');
                                                }}
                                                className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
                                            >
                                                <Check className="w-4 h-4" />
                                                {t('selectThisTheme')}
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
