'use client';

import { useEffect } from 'react';

interface ThemeInjectorProps {
    theme: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
        headerColor?: string;
        footerColor?: string;
        borderColor?: string;
        borderRadius?: string;
        shadow?: boolean;
        fontFamily?: string;
        headingWeight?: string;
        buttonStyle?: string;
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
        root.style.setProperty('--background-color', theme.backgroundColor || '#f0fdf4');
        root.style.setProperty('--text-color', theme.textColor || '#1a1a1a');
        root.style.setProperty('--button-color', theme.buttonColor || '#22c55e');
        root.style.setProperty('--header-color', theme.headerColor || '#d1fae5');
        root.style.setProperty('--footer-color', theme.footerColor || '#111827');
        root.style.setProperty('--border-color', theme.borderColor || '#d1d5db');
        root.style.setProperty('--border-radius', theme.borderRadius || '0.5rem');
        root.style.setProperty('--heading-weight', theme.headingWeight || '700');
        root.style.setProperty('--shadow-enabled', theme.shadow ? '1' : '0');
        root.style.setProperty('--font-family', theme.fontFamily || 'Inter, sans-serif');

        if (theme.gradient) {
        root.style.setProperty(
            '--gradient',
            `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.via || theme.gradient.from}, ${theme.gradient.to})`
        );
        }
    }, [theme]);

    return null;
}
