"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { storeThemes } from '@/public/themes';
import { THEME_PREVIEWS } from '@/components/store/constants/themePreviews';
import ThemeCard from './ThemeCard';

type ThemeConfig = (typeof storeThemes)[number];

interface ThemeGridProps {
    themes: ThemeConfig[];
    selectedThemeIndex: number | null;
    previewThemeId: number | null;
    onSelectTheme: (index: number) => void;
    onPreviewTheme: (themeId: number, event: React.MouseEvent<HTMLButtonElement>) => void;
    t: (key: string) => string;
}

const ThemeGrid: React.FC<ThemeGridProps> = ({
    themes,
    selectedThemeIndex,
    previewThemeId,
    onSelectTheme,
    onPreviewTheme,
    t,
}) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full"
    >
        {themes.slice(0, 10).map((theme, index) => {
            const themeId = index + 1;
            const isSelected = selectedThemeIndex === index;
            const isPreviewing = previewThemeId === themeId;
            const preview = THEME_PREVIEWS.find((p) => p.themeId === themeId);

            return (
                <ThemeCard
                    key={themeId}
                    theme={theme}
                    themeId={themeId}
                    index={index}
                    isSelected={isSelected}
                    isPreviewing={isPreviewing}
                    preview={preview}
                    onSelect={() => onSelectTheme(index)}
                    onPreview={(event) => onPreviewTheme(themeId, event)}
                    t={t}
                />
            );
        })}
    </motion.div>
);

export default ThemeGrid;
