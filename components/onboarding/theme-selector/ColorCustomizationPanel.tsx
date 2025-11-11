"use client";

import React from 'react';
import type { storeThemes } from '@/public/themes';

type ThemeConfig = (typeof storeThemes)[number];

type ColorKey = 'primary' | 'secondary' | 'text' | 'surface';

interface ColorCustomizationPanelProps {
    primaryColor: string;
    secondaryColor?: string;
    textColor: string;
    surfaceColor?: string;
    currentTheme: ThemeConfig;
    isSelectedTheme: boolean;
    updatePreviewColor: (type: ColorKey, value: string, isSelected: boolean) => void;
    t: (key: string) => string;
}

const lightenHex = (hex: string, amount = 0.75) => {
    const normalized = hex.replace('#', '').trim();
    if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
        return '#f8fafc';
    }

    const expanded = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;

    const bigint = Number.parseInt(expanded, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
    const toHex = (value: number) => value.toString(16).padStart(2, '0');

    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
};

const ColorCustomizationPanel: React.FC<ColorCustomizationPanelProps> = ({
    primaryColor,
    secondaryColor,
    textColor,
    surfaceColor,
    currentTheme,
    isSelectedTheme,
    updatePreviewColor,
    t,
}) => {
    const scheduleColorUpdate = (type: ColorKey, value: string) => {
        requestAnimationFrame(() => {
            updatePreviewColor(type, value, isSelectedTheme);
        });
    };

    const handleInputChange = (type: ColorKey, value: string) => {
        const fallbackValue =
            type === 'primary'
                ? currentTheme.theme.primaryColor
                : type === 'secondary'
                    ? currentTheme.theme.secondaryColor || currentTheme.theme.primaryColor
                    : type === 'surface'
                        ? currentTheme.theme.surfaceColor || lightenHex(currentTheme.theme.primaryColor)
                        : currentTheme.theme.textColor || '#111827';
        const safeFallback = fallbackValue || '#ffffff';

        if (value === '' || /^#[0-9A-F]{0,6}$/i.test(value)) {
            scheduleColorUpdate(type, value || safeFallback);
        }
    };

    const handleBlur = (type: ColorKey, value: string) => {
        if (value === '' || /^#[0-9A-F]{6}$/i.test(value)) {
            return;
        }

        const fallbackValue =
            type === 'primary'
                ? currentTheme.theme.primaryColor
                : type === 'secondary'
                    ? currentTheme.theme.secondaryColor || currentTheme.theme.primaryColor
                    : type === 'surface'
                        ? currentTheme.theme.surfaceColor || lightenHex(currentTheme.theme.primaryColor)
                        : currentTheme.theme.textColor || '#111827';

        scheduleColorUpdate(type, fallbackValue || '#ffffff');
    };

    const resolvedSurface = surfaceColor || currentTheme.theme.surfaceColor || lightenHex(currentTheme.theme.primaryColor);

    return (
        <>
            <div className="mb-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{t('customizeColors')}</h4>
                <p className="text-xs text-gray-600">{t('adjustColors')}</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-700">{t('primaryColor')}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => scheduleColorUpdate('primary', e.target.value)}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation"
                        />
                        <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => handleInputChange('primary', e.target.value)}
                            onBlur={(e) => handleBlur('primary', e.target.value)}
                            placeholder={currentTheme.theme.primaryColor}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div
                        className="h-10 sm:h-12 rounded-lg border border-gray-200 shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                    />
                </div>

                {currentTheme.theme.secondaryColor && (
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">{t('secondaryColor')}</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => scheduleColorUpdate('secondary', e.target.value)}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation"
                            />
                            <input
                                type="text"
                                value={secondaryColor}
                                onChange={(e) => handleInputChange('secondary', e.target.value)}
                                onBlur={(e) => handleBlur('secondary', e.target.value)}
                                placeholder={currentTheme.theme.secondaryColor}
                                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                            />
                        </div>
                        <div
                            className="h-10 sm:h-12 rounded-lg border border-gray-200 shadow-sm"
                            style={{ backgroundColor: secondaryColor }}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-700">{t('surfaceColor')}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={resolvedSurface}
                            onChange={(e) => scheduleColorUpdate('surface', e.target.value)}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation"
                        />
                        <input
                            type="text"
                            value={resolvedSurface}
                            onChange={(e) => handleInputChange('surface', e.target.value)}
                            onBlur={(e) => handleBlur('surface', e.target.value)}
                            placeholder={currentTheme.theme.surfaceColor || lightenHex(currentTheme.theme.primaryColor)}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div
                        className="h-10 sm:h-12 rounded-lg border border-gray-200 shadow-sm"
                        style={{ backgroundColor: resolvedSurface }}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-700">{t('textColor')}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => scheduleColorUpdate('text', e.target.value)}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation"
                        />
                        <input
                            type="text"
                            value={textColor}
                            onChange={(e) => handleInputChange('text', e.target.value)}
                            onBlur={(e) => handleBlur('text', e.target.value)}
                            placeholder={currentTheme.theme.textColor}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div
                        className="h-10 sm:h-12 rounded-lg border border-gray-200 shadow-sm"
                        style={{ backgroundColor: textColor }}
                    />
                </div>
            </div>
        </>
    );
};

export default ColorCustomizationPanel;
