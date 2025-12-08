"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { storeThemes } from "@/public/themes";
import ThemePreviewModal from "@/components/onboarding/theme-selector/ThemePreviewModal";
import PageHeader from "@/components/edit-theme/PageHeader";
import PageTitle from "@/components/edit-theme/PageTitle";
import ActionButtons from "@/components/edit-theme/ActionButtons";
import TabNavigation from "@/components/edit-theme/TabNavigation";
import ThemeSelectionTab from "@/components/edit-theme/ThemeSelectionTab";
import ThemePreview from "@/components/edit-theme/ThemePreview";
import PreviewControls from "@/components/edit-theme/PreviewControls";
import ColorCustomizationSection from "@/components/edit-theme/ColorCustomizationSection";
import LogoLoader from "@/components/themePreview/loadder";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { useSettingsData } from "@/hooks/settings/useSettingsData";
import type { SerializedStore } from "@/lib/data/store";
import type { IProduct } from "@/models/store/products";

type ColorKey = "primary" | "secondary" | "text" | "surface";
type PreviewPage = "STORE_PAGE" | "PRODUCT_PAGE";

type ColorState = {
    primary: string;
    secondary: string;
    text: string;
    surface: string;
};

const normalizeThemeId = (themeId: number | string | undefined): number => {
    if (typeof themeId === "number") return themeId;
    if (typeof themeId === "string") {
        const parsed = parseInt(themeId, 10);
        if (!Number.isNaN(parsed)) return parsed;
    }
    return 1;
};

const buildPreviewStore = (store: SerializedStore, colors: ColorState): SerializedStore => {
    const themeId = normalizeThemeId(store.themeId);
    return {
        ...store,
        themeId,
        theme: {
            ...store.theme,
            primaryColor: colors.primary,
            secondaryColor: colors.secondary,
            textColor: colors.text,
            surfaceColor: colors.surface,
        },
    };
};

export default function EditThemePage() {
    const { data: featuresData, loading, error } = useUserFeatures();
    const { store, updateStoreField } = useSettingsData(featuresData);

    // State management
    const [products, setProducts] = useState<IProduct[]>([]);
    const [previewPage, setPreviewPage] = useState<PreviewPage>("STORE_PAGE");
    const [saving, setSaving] = useState(false);
    const [scale, setScale] = useState(1);
    const [showColorControls, setShowColorControls] = useState(false);
    const [activeTab, setActiveTab] = useState<"theme-select" | "color-customize">("theme-select");
    const [previewThemeId, setPreviewThemeId] = useState<number | null>(null);
    const [showThemePreview, setShowThemePreview] = useState(false);

    // Theme management
    const themeId = useMemo(() => normalizeThemeId(store?.themeId || 1), [store?.themeId]);
    const baseTheme = useMemo(() => storeThemes[Math.max(themeId - 1, 0)] || storeThemes[0], [themeId]);

    const [colors, setColors] = useState<ColorState>(() => ({
        primary: baseTheme.theme.primaryColor,
        secondary: baseTheme.theme.secondaryColor || baseTheme.theme.primaryColor,
        text: baseTheme.theme.textColor || "#111827",
        surface: baseTheme.theme.surfaceColor || "#f8fafc",
    }));

    // Update preview scale on window resize
    useEffect(() => {
        const updateScale = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setScale(1);
            } else if (width < 1024) {
                setScale(0.48);
            } else if (width < 1280) {
                setScale(0.58);
            } else {
                setScale(0.7);
            }
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    // Sync colors with store theme
    useEffect(() => {
        if (!store) return;
        setColors({
            primary: store.theme?.primaryColor || baseTheme.theme.primaryColor,
            secondary: store.theme?.secondaryColor || baseTheme.theme.secondaryColor || baseTheme.theme.primaryColor,
            text: store.theme?.textColor || baseTheme.theme.textColor || "#111827",
            surface: store.theme?.surfaceColor || baseTheme.theme.surfaceColor || "#f8fafc",
        });
    }, [store?.theme?.primaryColor, store?.theme?.secondaryColor, store?.theme?.textColor, store?.theme?.surfaceColor, baseTheme.theme.primaryColor, baseTheme.theme.secondaryColor, baseTheme.theme.textColor, baseTheme.theme.surfaceColor]);

    // Fetch products for preview
    useEffect(() => {
        const fetchProducts = async () => {
            if (!store?.owner) return;
            try {
                const res = await fetch(`/api/products?owner=${store.owner}`);
                if (!res.ok) return;
                const data = await res.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error("Failed to load products for preview", err);
            }
        };
        fetchProducts();
    }, [store?.owner]);

    // Build preview store with custom colors
    const previewStore = useMemo<SerializedStore | null>(() => {
        if (!store) return null;
        return buildPreviewStore(store, colors);
    }, [store, colors]);

    // Current theme with custom colors
    const currentTheme = useMemo(() => ({
        ...baseTheme,
        theme: {
            ...baseTheme.theme,
            primaryColor: colors.primary,
            secondaryColor: colors.secondary,
            textColor: colors.text,
            surfaceColor: colors.surface,
        },
    }), [baseTheme, colors.primary, colors.secondary, colors.text, colors.surface]);

    // Handlers
    const updatePreviewColor = useCallback((type: ColorKey, value: string) => {
        setColors((prev) => ({ ...prev, [type]: value }));
    }, []);

    const handleSelectTheme = async (themeIndex: number) => {
        if (!store) return;
        await updateStoreField("themeId", themeIndex + 1);
        setActiveTab("color-customize");
    };

    const handleSave = useCallback(async () => {
        if (!store) return;
        setSaving(true);
        try {
            await updateStoreField("theme", {
                ...store.theme,
                primaryColor: colors.primary,
                secondaryColor: colors.secondary,
                textColor: colors.text,
                surfaceColor: colors.surface,
            });
        } finally {
            setSaving(false);
        }
    }, [store, colors.primary, colors.secondary, colors.text, colors.surface, updateStoreField]);

    const handleResetColors = () => {
        setColors({
            primary: baseTheme.theme.primaryColor,
            secondary: baseTheme.theme.secondaryColor || baseTheme.theme.primaryColor,
            text: baseTheme.theme.textColor || "#111827",
            surface: baseTheme.theme.surfaceColor || "#f8fafc",
        });
    };

    // Loading states
    if (loading) return <LogoLoader />;
    if (error) return <p className="text-red-500 px-4">Error: {error}</p>;
    if (!store) return <p className="text-red-500 px-4">Store not found.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-8">
            <div className="max-w-full mx-auto sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <PageHeader />

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <PageTitle />
                        <ActionButtons
                            onReset={handleResetColors}
                            onSave={handleSave}
                            saving={saving}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Content */}
                <div className="mt-6 sm:mt-8">
                    {activeTab === "theme-select" && (
                        <ThemeSelectionTab
                            themes={storeThemes}
                            selectedThemeIndex={store.themeId ? store.themeId - 1 : 0}
                            previewThemeId={previewThemeId}
                            onSelectTheme={handleSelectTheme}
                            onPreviewTheme={(themeId) => {
                                setPreviewThemeId(themeId);
                                setShowThemePreview(true);
                            }}
                        />
                    )}

                    {activeTab === "color-customize" && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                                <PreviewControls
                                    previewPage={previewPage}
                                    showColorControls={showColorControls}
                                    onPageChange={setPreviewPage}
                                    onToggleControls={() => setShowColorControls((prev) => !prev)}
                                />

                                <ThemePreview
                                    previewStore={previewStore}
                                    products={products}
                                    previewPage={previewPage}
                                    scale={scale}
                                />
                            </div>

                            {showColorControls && (
                                <ColorCustomizationSection
                                    colors={colors}
                                    currentTheme={currentTheme}
                                    onColorChange={updatePreviewColor}
                                    onClose={() => setShowColorControls(false)}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Theme Preview Modal */}
                {showThemePreview && previewThemeId !== null && (
                    <ThemePreviewModal
                        previewThemeId={previewThemeId}
                        previewPage="STORE_PAGE"
                        onClose={() => setShowThemePreview(false)}
                        onSelectTheme={handleSelectTheme}
                        setPreviewPage={() => {}}
                        showColorPanel={false}
                        setShowColorPanel={() => {}}
                        previewPrimaryColor={""}
                        previewSecondaryColor={""}
                        previewTextColor={""}
                        previewSurfaceColor={""}
                        setPreviewPrimaryColor={() => {}}
                        setPreviewSecondaryColor={() => {}}
                        setPreviewTextColor={() => {}}
                        setPreviewSurfaceColor={() => {}}
                        customPrimaryColor={""}
                        customSecondaryColor={""}
                        customTextColor={""}
                        customSurfaceColor={""}
                        setCustomPrimaryColor={() => {}}
                        setCustomSecondaryColor={() => {}}
                        setCustomTextColor={() => {}}
                        setCustomSurfaceColor={() => {}}
                        selectedThemeIndex={store.themeId ? store.themeId - 1 : 0}
                        updatePreviewColor={() => {}}
                        previewStoreElement={null}
                        t={(key) => key}
                    />
                )}
            </div>
        </div>
    );
}
