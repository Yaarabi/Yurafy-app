"use client";

import { Palette, X } from "lucide-react";
import ColorCustomizationPanel from "@/components/onboarding/theme-selector/ColorCustomizationPanel";
import type { storeThemes } from "@/public/themes";

type ThemeConfig = (typeof storeThemes)[number];
type ColorKey = "primary" | "secondary" | "text" | "surface";

type ColorState = {
    primary: string;
    secondary: string;
    text: string;
    surface: string;
};

interface ColorCustomizationPanelProps {
    colors: ColorState;
    currentTheme: ThemeConfig;
    onColorChange: (type: ColorKey, value: string) => void;
    onClose: () => void;
}

export default function ColorCustomizationSection({
    colors,
    currentTheme,
    onColorChange,
    onClose,
}: ColorCustomizationPanelProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    Color Customization
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="Close color controls"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <ColorCustomizationPanel
                primaryColor={colors.primary}
                secondaryColor={colors.secondary}
                textColor={colors.text}
                surfaceColor={colors.surface}
                currentTheme={currentTheme}
                isSelectedTheme
                updatePreviewColor={(type, value) => onColorChange(type, value)}
                t={(key) => key}
            />
        </div>
    );
}
