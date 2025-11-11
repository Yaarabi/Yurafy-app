// ThemeInjector.tsx
'use client';

import { useEffect } from 'react';

interface ThemeInjectorProps {
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        textColor?: string;
    surfaceColor?: string;
        gradient?: {
        from?: string;
        via?: string;
        to?: string;
        };
    };
}

export default function ThemeInjector({ theme }: ThemeInjectorProps) {
    useEffect(() => {
        if (!theme) return;

        const root = document.documentElement;

        // Set CSS variables for theme colors
        root.style.setProperty('--color-primary', theme.primaryColor || '#3B82F6');
        root.style.setProperty('--color-secondary', theme.secondaryColor || theme.primaryColor || '#3B82F6');
        root.style.setProperty('--color-text', theme.textColor || '#ffffff');
    root.style.setProperty('--surface-color', theme.surfaceColor || '#f8fafc');
        root.style.setProperty('--primary-color', theme.primaryColor || '#3B82F6');
        root.style.setProperty('--secondary-color', theme.secondaryColor || theme.primaryColor || '#3B82F6');
        root.style.setProperty('--text-color', theme.textColor || '#ffffff');

        // Calculate light and dark variants for better UI/UX
        const primaryColor = theme.primaryColor || '#3B82F6';
        root.style.setProperty('--color-primary-light', primaryColor + '20');
        root.style.setProperty('--color-primary-dark', primaryColor);

        if (theme.gradient) {
            root.style.setProperty(
                '--gradient',
                `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.via || theme.gradient.from}, ${theme.gradient.to})`
            );
        }
    }, [theme]);

    return null;
}
