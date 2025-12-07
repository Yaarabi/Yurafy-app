"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { storeThemes } from "@/public/themes";
import ThemeGrid from "@/components/onboarding/theme-selector/ThemeGrid";
import ThemePreviewModal from "@/components/onboarding/theme-selector/ThemePreviewModal";
import { useSettingsData } from "@/hooks/settings/useSettingsData";
import { Sparkles } from "lucide-react";
import { useUserFeatures } from "@/hooks/useUserFeatures";

export default function ThemeSelectPage() {
    const router = useRouter();
    const params = useParams();
    const { data: featuresData } = useUserFeatures();
    const { store, updateStoreField } = useSettingsData(featuresData);
    const [previewThemeId, setPreviewThemeId] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleSelectTheme = async (themeIndex: number) => {
        if (!store) return;
        await updateStoreField("themeId", themeIndex + 1);
        router.push(`/${params.locale}/dashboard/settings/theme`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 flex items-center gap-2 text-indigo-700">
                    <Sparkles className="w-5 h-5" />
                    <h1 className="text-2xl font-bold">Select Your Store Theme</h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                    Choose from 10 beautiful themes. Preview each theme with your real store data before applying.
                </p>
                <ThemeGrid
                    themes={storeThemes}
                    selectedThemeIndex={store ? (store.themeId ? store.themeId - 1 : 0) : null}
                    previewThemeId={previewThemeId}
                    onSelectTheme={handleSelectTheme}
                    onPreviewTheme={(themeId) => { setPreviewThemeId(themeId); setShowPreview(true); }}
                    t={(key) => key}
                />
                {showPreview && previewThemeId !== null && (
                    <ThemePreviewModal
                        previewThemeId={previewThemeId}
                        previewPage="STORE_PAGE"
                        onClose={() => setShowPreview(false)}
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
                        selectedThemeIndex={store ? (store.themeId ? store.themeId - 1 : 0) : null}
                        updatePreviewColor={() => {}}
                        previewStoreElement={null}
                        t={(key) => key}
                    />
                )}
            </div>
        </div>
    );
}
