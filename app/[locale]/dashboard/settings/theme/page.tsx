"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MonitorSmartphone, Palette, Sparkles, X } from "lucide-react";
import { storeThemes } from "@/public/themes";
import ColorCustomizationPanel from "@/components/onboarding/theme-selector/ColorCustomizationPanel";
import ThemeRenderer from "@/components/store/themes/ThemeRenderer";
import ThemeInjector from "@/components/productPage/ThemeInjector";
import { StoreProvider } from "@/components/store/context/StoreContext";
import { useStore } from "@/components/store/hooks/useStore";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { useSettingsData } from "@/hooks/settings/useSettingsData";
import LogoLoader from "@/components/themePreview/loadder";
import type { SerializedStore } from "@/lib/data/store";
import type { IProduct } from "@/models/products";

type ColorKey = "primary" | "secondary" | "text" | "surface";
type PreviewPage = "STORE_PAGE" | "PRODUCT_PAGE";

type ColorState = {
    primary: string;
    secondary: string;
    text: string;
    surface: string;
};

const ProductPreviewInitializer = ({ active }: { active: boolean }) => {
    const { products, selectedProduct, selectProduct } = useStore();
    useEffect(() => {
        if (active && !selectedProduct && products && products.length > 0) {
            selectProduct(products[0]);
        }
    }, [active, selectedProduct, products, selectProduct]);
    return null;
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

export default function ThemeSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: featuresData, loading, error } = useUserFeatures();
    const { store, updateStoreField } = useSettingsData(featuresData);

    const [products, setProducts] = useState<IProduct[]>([]);
    const [previewPage, setPreviewPage] = useState<PreviewPage>("STORE_PAGE");
    const [saving, setSaving] = useState(false);
    const [scale, setScale] = useState(1);
    const [showControls, setShowControls] = useState(false);

    const themeId = useMemo(() => normalizeThemeId(store?.themeId || 1), [store?.themeId]);
    const baseTheme = useMemo(() => storeThemes[Math.max(themeId - 1, 0)] || storeThemes[0], [themeId]);

    const [colors, setColors] = useState<ColorState>(() => ({
        primary: baseTheme.theme.primaryColor,
        secondary: baseTheme.theme.secondaryColor || baseTheme.theme.primaryColor,
        text: baseTheme.theme.textColor || "#111827",
        surface: baseTheme.theme.surfaceColor || "#f8fafc",
    }));

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

    useEffect(() => {
        if (!store) return;
        setColors({
            primary: store.theme?.primaryColor || baseTheme.theme.primaryColor,
            secondary: store.theme?.secondaryColor || baseTheme.theme.secondaryColor || baseTheme.theme.primaryColor,
            text: store.theme?.textColor || baseTheme.theme.textColor || "#111827",
            surface: store.theme?.surfaceColor || baseTheme.theme.surfaceColor || "#f8fafc",
        });
    }, [store?.theme?.primaryColor, store?.theme?.secondaryColor, store?.theme?.textColor, store?.theme?.surfaceColor, baseTheme.theme.primaryColor, baseTheme.theme.secondaryColor, baseTheme.theme.textColor, baseTheme.theme.surfaceColor]);

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

    const previewStore = useMemo<SerializedStore | null>(() => {
        if (!store) return null;
        return buildPreviewStore(store, colors);
    }, [store, colors]);

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

    const updatePreviewColor = useCallback((type: ColorKey, value: string) => {
        setColors((prev) => ({ ...prev, [type]: value }));
    }, []);

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

    const handleBack = () => {
        const locale = (params as any)?.locale || "en";
        router.push(`/${locale}/dashboard/settings?tab=store`);
    };

    if (loading) return <LogoLoader />;
    if (error) return <p className="text-red-500 px-4">Error: {error}</p>;
    if (!store) return <p className="text-red-500 px-4">Store not found.</p>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
            <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-6 sm:py-10">
                <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 text-sm text-indigo-700">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 text-indigo-700 font-semibold hover:text-indigo-900 active:scale-95 transition-transform"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to settings
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Theme preview & colors
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Preview your live store</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                                See your store with real data, switch between store and product views, and adjust theme colors before saving.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setColors({
                                    primary: baseTheme.theme.primaryColor,
                                    secondary: baseTheme.theme.secondaryColor || baseTheme.theme.primaryColor,
                                    text: baseTheme.theme.textColor || "#111827",
                                    surface: baseTheme.theme.surfaceColor || "#f8fafc",
                                })}
                                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-95 transition-transform"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Palette className="w-4 h-4" />
                                {saving ? "Saving..." : "Save colors"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                            <MonitorSmartphone className="w-4 h-4" /> Live preview
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPreviewPage("STORE_PAGE")}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${previewPage === "STORE_PAGE" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Store page
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewPage("PRODUCT_PAGE")}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${previewPage === "PRODUCT_PAGE" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Product page
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowControls((prev) => !prev)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 transition-transform"
                            >
                                <Palette className="w-4 h-4" /> {showControls ? "Hide colors" : "Show colors"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                        {previewStore ? (
                            <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-inner">
                                <ThemeInjector theme={previewStore.theme} />
                                <StoreProvider stores={[previewStore]} initialStore={previewStore} products={products} disableNavigation>
                                    <ProductPreviewInitializer active={previewPage === "PRODUCT_PAGE"} />
                                    <div
                                        className="origin-top-left"
                                        style={scale < 1 ? { transform: `scale(${scale})`, width: `${100 / scale}%` } : {}}
                                    >
                                        <ThemeRenderer themeId={previewStore.themeId || 1} currentPage={previewPage} />
                                    </div>
                                </StoreProvider>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">No store data available for preview.</div>
                        )}
                    </div>
                </div>
            </div>
            {showControls && (
                <div className="fixed bottom-4 right-4 z-50 w-[320px] max-w-[90vw] shadow-2xl">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 relative">
                        <button
                            type="button"
                            onClick={() => setShowControls(false)}
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                            aria-label="Close color controls"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-3 pr-8">
                            <Palette className="w-4 h-4" /> Color controls
                        </div>
                        <ColorCustomizationPanel
                            primaryColor={colors.primary}
                            secondaryColor={colors.secondary}
                            textColor={colors.text}
                            surfaceColor={colors.surface}
                            currentTheme={currentTheme}
                            isSelectedTheme
                            updatePreviewColor={(type, value) => updatePreviewColor(type, value)}
                            t={(key) => key}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
