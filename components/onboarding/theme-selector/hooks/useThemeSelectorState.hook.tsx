'use client';

import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect, type MouseEvent, type ReactNode } from 'react';
import { storeThemes } from '../../../../public/themes';
import { THEME_PREVIEWS, type ThemePreview } from '../../../store/constants/themePreviews';
import { StoreProvider } from '../../../store/context/StoreContext';
import ThemeRenderer from '../../../store/themes/ThemeRenderer';
import { FAKE_PRODUCTS } from '../../../store/constants/data';
import type { SerializedStore } from '../../../../lib/data/store';
import type { IProduct } from '../../../../models/products';
import ProductPageAutoSelect from '../ProductPageAutoSelect';

type PreviewPage = 'STORE_PAGE' | 'PRODUCT_PAGE';

type ColorKey = 'primary' | 'secondary' | 'text' | 'surface';

interface ThemeSelection {
    primaryColor: string;
    secondaryColor?: string;
    textColor?: string;
    surfaceColor?: string;
}

interface UseThemeSelectorStateProps {
    onThemeSelect: (themeId: number, theme: ThemeSelection) => void;
}

interface ScaledPreviewProps {
    scale: number;
    storeKey: string;
    children: ReactNode;
}

const MIN_PREVIEW_HEIGHT = 720;

const ScaledPreview = ({ scale, storeKey, children }: ScaledPreviewProps) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);

    useLayoutEffect(() => {
        const element = contentRef.current;
        if (!element) {
            return;
        }

        const updateHeight = () => {
            setContentHeight(element.offsetHeight);
        };

        updateHeight();

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => {
                updateHeight();
            });
            observer.observe(element);

            return () => {
                observer.disconnect();
            };
        }

        const intervalId = window.setInterval(updateHeight, 500);
        return () => window.clearInterval(intervalId);
    }, [scale, storeKey]);

    const baseClassName = 'w-full bg-white rounded-lg shadow-2xl border border-gray-200';

    if (scale === 1) {
        return (
            <div ref={contentRef} className={baseClassName}>
                {children}
            </div>
        );
    }

    const scaledHeight = contentHeight > 0 ? contentHeight * scale : MIN_PREVIEW_HEIGHT;

    const scaledWidthPercent = `${100 / scale}%`;

    return (
        <div className="relative w-full overflow-hidden" style={{ height: scaledHeight }}>
            <div
                ref={contentRef}
                className={baseClassName}
                style={{
                    transform: `translateX(-50%) scale(${scale})`,
                    transformOrigin: 'top center',
                    width: scaledWidthPercent,
                    maxWidth: 'none',
                    overflow: 'visible',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                }}
            >
                {children}
            </div>
        </div>
    );
};

interface ColorControls {
    primary: string;
    secondary: string;
    text: string;
    surface: string;
    setPrimary: (value: string) => void;
    setSecondary: (value: string) => void;
    setText: (value: string) => void;
    setSurface: (value: string) => void;
}

export interface UseThemeSelectorStateResult {
    selectedThemeIndex: number | null;
    previewThemeId: number | null;
    previewPage: PreviewPage;
    showColorPanel: boolean;
    previewColors: ColorControls;
    customColors: ColorControls;
    selectTheme: (index: number, preserveColors?: boolean) => void;
    previewTheme: (themeId: number, event: MouseEvent<HTMLButtonElement>) => void;
    closePreview: () => void;
    continueWithTheme: () => void;
    setPreviewPage: (page: PreviewPage) => void;
    setShowColorPanel: (value: boolean) => void;
    updatePreviewColor: (type: ColorKey, value: string, isSelected: boolean) => void;
    previewStoreElement: ReactNode | null;
}

const demoProduct: IProduct | undefined = FAKE_PRODUCTS.find((item: IProduct) => item._id === 'product_preview_demo') || FAKE_PRODUCTS[0];

const useThemeSelectorState = ({ onThemeSelect }: UseThemeSelectorStateProps): UseThemeSelectorStateResult => {
    const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);
    const [previewThemeId, setPreviewThemeId] = useState<number | null>(null);
    const [previewPage, setPreviewPage] = useState<PreviewPage>('STORE_PAGE');
    const [showColorPanel, setShowColorPanel] = useState<boolean>(false);

    const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('');
    const [customSecondaryColor, setCustomSecondaryColor] = useState<string>('');
    const [customTextColor, setCustomTextColor] = useState<string>('');
    const [customSurfaceColor, setCustomSurfaceColor] = useState<string>('');

    const [previewPrimaryColor, setPreviewPrimaryColor] = useState<string>('');
    const [previewSecondaryColor, setPreviewSecondaryColor] = useState<string>('');
    const [previewTextColor, setPreviewTextColor] = useState<string>('');
    const [previewSurfaceColor, setPreviewSurfaceColor] = useState<string>('');

    const [scale, setScale] = useState<number>(0.4);

    useEffect(() => {
        const updateScale = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setScale(0.32);
                return;
            }
            if (width < 1024) {
                setScale(0.45);
                return;
            }
            if (width < 1280) {
                setScale(0.55);
                return;
            }
            setScale(0.65);
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const getPreviewStore = useCallback(
        (themeId: number): SerializedStore => {
            const preview = THEME_PREVIEWS.find((item: ThemePreview) => item.themeId === themeId);
            const themeData = storeThemes[themeId - 1];
            const isPreviewTheme = previewThemeId === themeId;
            const isSelectedTheme = selectedThemeIndex !== null && themeId === selectedThemeIndex + 1;

            const primaryColor = isPreviewTheme && previewPrimaryColor
                ? previewPrimaryColor
                : isSelectedTheme && customPrimaryColor
                    ? customPrimaryColor
                    : themeData.theme.primaryColor;

            const secondaryColor = isPreviewTheme && previewSecondaryColor
                ? previewSecondaryColor
                : isSelectedTheme && customSecondaryColor
                    ? customSecondaryColor
                    : themeData.theme.secondaryColor;

            const textColor = isPreviewTheme && previewTextColor
                ? previewTextColor
                : isSelectedTheme && customTextColor
                    ? customTextColor
                    : themeData.theme.textColor;

            const surfaceColor = isPreviewTheme && previewSurfaceColor
                ? previewSurfaceColor
                : isSelectedTheme && customSurfaceColor
                    ? customSurfaceColor
                    : themeData.theme.surfaceColor;

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
                    surfaceColor,
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
                socialLinks: { facebook: '#', instagram: '#', tiktok: '#' },
                headerLinks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        },
        [
            previewThemeId,
            previewPrimaryColor,
            previewSecondaryColor,
            previewTextColor,
            previewSurfaceColor,
            selectedThemeIndex,
            customPrimaryColor,
            customSecondaryColor,
            customTextColor,
            customSurfaceColor,
        ]
    );

    const updatePreviewColor = useCallback(
        (type: ColorKey, value: string, isSelectedTheme: boolean) => {
            if (type === 'primary') {
                setPreviewPrimaryColor(value);
                if (isSelectedTheme) {
                    setCustomPrimaryColor(value);
                }
                return;
            }

            if (type === 'secondary') {
                setPreviewSecondaryColor(value);
                if (isSelectedTheme) {
                    setCustomSecondaryColor(value);
                }
                return;
            }

            if (type === 'surface') {
                setPreviewSurfaceColor(value);
                if (isSelectedTheme) {
                    setCustomSurfaceColor(value);
                }
                return;
            }

            setPreviewTextColor(value);
            if (isSelectedTheme) {
                setCustomTextColor(value);
            }
        },
        [
            setPreviewPrimaryColor,
            setPreviewSecondaryColor,
            setPreviewSurfaceColor,
            setPreviewTextColor,
            setCustomPrimaryColor,
            setCustomSecondaryColor,
            setCustomSurfaceColor,
            setCustomTextColor,
        ]
    );

    const previewTheme = useCallback(
        (themeId: number, event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();

            if (previewThemeId === themeId) {
                setPreviewThemeId(null);
                setPreviewPrimaryColor('');
                setPreviewSecondaryColor('');
                setPreviewTextColor('');
                setPreviewSurfaceColor('');
                setShowColorPanel(false);
                return;
            }

            setPreviewThemeId(themeId);
            setPreviewPage('STORE_PAGE');
            setShowColorPanel(false);

            const themeIndex = themeId - 1;
            const isSelected = selectedThemeIndex === themeIndex;
            const themeData = storeThemes[themeIndex];

            setPreviewPrimaryColor(isSelected ? customPrimaryColor || themeData.theme.primaryColor : themeData.theme.primaryColor);
            setPreviewSecondaryColor(isSelected ? customSecondaryColor || themeData.theme.secondaryColor || '' : themeData.theme.secondaryColor || '');
            setPreviewTextColor(isSelected ? customTextColor || themeData.theme.textColor || '' : themeData.theme.textColor || '');
            setPreviewSurfaceColor(isSelected ? customSurfaceColor || themeData.theme.surfaceColor || '' : themeData.theme.surfaceColor || '');
        },
        [previewThemeId, selectedThemeIndex, customPrimaryColor, customSecondaryColor, customTextColor, customSurfaceColor]
    );

    const closePreview = useCallback(() => {
        setPreviewThemeId(null);
        setPreviewPrimaryColor('');
        setPreviewSecondaryColor('');
        setPreviewTextColor('');
        setPreviewSurfaceColor('');
        setShowColorPanel(false);
    }, []);

    const continueWithTheme = useCallback(() => {
        if (selectedThemeIndex === null) return;

        const themeData = storeThemes[selectedThemeIndex];
        const themeId = selectedThemeIndex + 1;

        onThemeSelect(themeId, {
            primaryColor: customPrimaryColor || themeData.theme.primaryColor,
            secondaryColor: customSecondaryColor || themeData.theme.secondaryColor || '',
            textColor: customTextColor || themeData.theme.textColor || '',
            surfaceColor: customSurfaceColor || themeData.theme.surfaceColor || '',
        });
    }, [selectedThemeIndex, customPrimaryColor, customSecondaryColor, customTextColor, customSurfaceColor, onThemeSelect]);

    const selectTheme = useCallback(
        (index: number, preserveColors: boolean = false) => {
            setSelectedThemeIndex(index);

            if (!preserveColors) {
                setCustomPrimaryColor('');
                setCustomSecondaryColor('');
                setCustomTextColor('');
                setCustomSurfaceColor('');
            }
        },
        []
    );

    const previewStoreElement = useMemo<ReactNode | null>(() => {
        if (!previewThemeId) return null;

        const previewStore = getPreviewStore(previewThemeId);
        const storeKey = `preview-${previewThemeId}-${previewPage}-${previewStore.theme.primaryColor}-${previewStore.theme.secondaryColor || ''}-${previewStore.theme.textColor || ''}-${previewStore.theme.surfaceColor || ''}`;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        const finalScale = isMobile ? 1 : scale;

        return (
            <StoreProvider key={storeKey} stores={[previewStore]} initialStore={previewStore} products={FAKE_PRODUCTS} disableNavigation>
                <ProductPageAutoSelect product={demoProduct} currentPage={previewPage} />
                <ScaledPreview scale={finalScale} storeKey={storeKey}>
                    <ThemeRenderer themeId={previewThemeId} currentPage={previewPage} />
                </ScaledPreview>
            </StoreProvider>
        );
    }, [previewThemeId, previewPage, scale, getPreviewStore]);

    return {
        selectedThemeIndex,
        previewThemeId,
        previewPage,
        showColorPanel,
        previewColors: {
            primary: previewPrimaryColor,
            secondary: previewSecondaryColor,
            text: previewTextColor,
            surface: previewSurfaceColor,
            setPrimary: setPreviewPrimaryColor,
            setSecondary: setPreviewSecondaryColor,
            setText: setPreviewTextColor,
            setSurface: setPreviewSurfaceColor,
        },
        customColors: {
            primary: customPrimaryColor,
            secondary: customSecondaryColor,
            text: customTextColor,
            surface: customSurfaceColor,
            setPrimary: setCustomPrimaryColor,
            setSecondary: setCustomSecondaryColor,
            setText: setCustomTextColor,
            setSurface: setCustomSurfaceColor,
        },
        selectTheme,
        previewTheme,
        closePreview,
        continueWithTheme,
        setPreviewPage,
        setShowColorPanel,
        updatePreviewColor,
        previewStoreElement,
    };
};

export default useThemeSelectorState;
