// ThemeInjector.tsx
'use client';

import { useEffect } from 'react';

interface ThemeInjectorProps {
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        textColor?: string;
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

        root.style.setProperty('--primary-color', theme.primaryColor || '#22c55e');
        root.style.setProperty('--secondary-color', theme.secondaryColor || '#16a34a');
        root.style.setProperty('--text-color', theme.textColor || 'white');

        if (theme.gradient) {
        root.style.setProperty(
            '--gradient',
            `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.via || theme.gradient.from}, ${theme.gradient.to})`
        );
        }
    }, [theme]);

    return null;
}
