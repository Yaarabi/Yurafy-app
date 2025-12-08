"use client";

import { Palette } from "lucide-react";
import ThemeGrid from "@/components/onboarding/theme-selector/ThemeGrid";
import type { storeThemes } from "@/public/themes";

type ThemeConfig = (typeof storeThemes)[number];

interface ThemeSelectionTabProps {
    themes: ThemeConfig[];
    selectedThemeIndex: number | null;
    previewThemeId: number | null;
    onSelectTheme: (index: number) => void;
    onPreviewTheme: (themeId: number) => void;
}

export default function ThemeSelectionTab({
    themes,
    selectedThemeIndex,
    previewThemeId,
    onSelectTheme,
    onPreviewTheme,
}: ThemeSelectionTabProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    Theme Selection
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Choose from 10 beautiful pre-designed themes. Preview each theme with your real store data before applying.
                </p>
                <ThemeGrid
                    themes={themes}
                    selectedThemeIndex={selectedThemeIndex}
                    previewThemeId={previewThemeId}
                    onSelectTheme={onSelectTheme}
                    onPreviewTheme={(themeId) => onPreviewTheme(themeId)}
                    t={(key) => key}
                />
            </div>
        </div>
    );
}
