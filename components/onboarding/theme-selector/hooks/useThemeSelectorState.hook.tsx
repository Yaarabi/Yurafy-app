'use client';

import { useState, useEffect, useMemo, useCallback, type MouseEvent, type ReactNode } from 'react';
import { storeThemes } from '../../../../public/themes';
import { THEME_PREVIEWS, type ThemePreview } from '../../../store/constants/themePreviews';
import { StoreProvider } from '../../../store/context/StoreContext';
import ThemeRenderer from '../../../store/themes/ThemeRenderer';
import { FAKE_PRODUCTS } from '../../../store/constants/data';
import type { SerializedStore } from '../../../../lib/data/store';
import type { IProduct } from '../../../../models/products';
import ProductPageAutoSelect from '../ProductPageAutoSelect';

type PreviewPage = 'STORE_PAGE' | 'PRODUCT_PAGE';

type ColorKey = 'primary' | 'secondary' | 'text';

interface ThemeSelection {
    primaryColor: string;
    secondaryColor?: string;
    textColor?: string;
}

interface UseThemeSelectorStateProps {
    onThemeSelect: (themeId: number, theme: ThemeSelection) => void;
}

interface ColorControls {
    primary: string;
    secondary: string;
    text: string;
    setPrimary: (value: string) => void;
    setSecondary: (value: string) => void;
    setText: (value: string) => void;
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

    const [previewPrimaryColor, setPreviewPrimaryColor] = useState<string>('');
    const [previewSecondaryColor, setPreviewSecondaryColor] = useState<string>('');
    const [previewTextColor, setPreviewTextColor] = useState<string>('');

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
                socialLinks: { facebook: '#', instagram: '#', tiktok: '#' },
                headerLinks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        },
        [previewThemeId, previewPrimaryColor, previewSecondaryColor, previewTextColor, selectedThemeIndex, customPrimaryColor, customSecondaryColor, customTextColor]
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

            setPreviewTextColor(value);
            if (isSelectedTheme) {
                setCustomTextColor(value);
            }
        },
        [setPreviewPrimaryColor, setPreviewSecondaryColor, setPreviewTextColor, setCustomPrimaryColor, setCustomSecondaryColor, setCustomTextColor]
    );

    const previewTheme = useCallback(
        (themeId: number, event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();

            if (previewThemeId === themeId) {
                setPreviewThemeId(null);
                setPreviewPrimaryColor('');
                setPreviewSecondaryColor('');
                setPreviewTextColor('');
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
            setPreviewTextColor(isSelected ? customTextColor || themeData.theme.textColor : themeData.theme.textColor);
        },
        [previewThemeId, selectedThemeIndex, customPrimaryColor, customSecondaryColor, customTextColor]
    );

    const closePreview = useCallback(() => {
        setPreviewThemeId(null);
        setPreviewPrimaryColor('');
        setPreviewSecondaryColor('');
        setPreviewTextColor('');
        setShowColorPanel(false);
    }, []);

    const continueWithTheme = useCallback(() => {
        if (selectedThemeIndex === null) return;

        const themeData = storeThemes[selectedThemeIndex];
        const themeId = selectedThemeIndex + 1;

        onThemeSelect(themeId, {
            primaryColor: customPrimaryColor || themeData.theme.primaryColor,
            secondaryColor: customSecondaryColor || themeData.theme.secondaryColor,
            textColor: customTextColor || themeData.theme.textColor,
        });
    }, [selectedThemeIndex, customPrimaryColor, customSecondaryColor, customTextColor, onThemeSelect]);

    const selectTheme = useCallback(
        (index: number, preserveColors: boolean = false) => {
            setSelectedThemeIndex(index);

            if (!preserveColors) {
                setCustomPrimaryColor('');
                setCustomSecondaryColor('');
                setCustomTextColor('');
            }
        },
        []
    );

    const previewStoreElement = useMemo<ReactNode | null>(() => {
        if (!previewThemeId) return null;

        const previewStore = getPreviewStore(previewThemeId);
        const storeKey = `preview-${previewThemeId}-${previewPage}-${previewStore.theme.primaryColor}-${previewStore.theme.secondaryColor || ''}-${previewStore.theme.textColor || ''}`;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        const finalScale = isMobile ? 1 : scale;

        return (
            <StoreProvider key={storeKey} stores={[previewStore]} initialStore={previewStore} products={FAKE_PRODUCTS}>
                <ProductPageAutoSelect product={demoProduct} currentPage={previewPage} />
                <div
                    className="w-full bg-white rounded-lg shadow-2xl border border-gray-200"
                    style={{
                        transform: `scale(${finalScale})`,
                        transformOrigin: 'top center',
                        width: '100%',
                        maxWidth: '100%',
                        margin: '0 auto',
                        overflow: 'visible',
                    }}
                >
                    <ThemeRenderer themeId={previewThemeId} currentPage={previewPage} />
                </div>
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
            setPrimary: setPreviewPrimaryColor,
            setSecondary: setPreviewSecondaryColor,
            setText: setPreviewTextColor,
        },
        customColors: {
            primary: customPrimaryColor,
            secondary: customSecondaryColor,
            text: customTextColor,
            setPrimary: setCustomPrimaryColor,
            setSecondary: setCustomSecondaryColor,
            setText: setCustomTextColor,
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
