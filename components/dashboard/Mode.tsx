
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-md 
                    bg-gray-200 text-gray-800 
                    dark:bg-gray-700 dark:text-gray-100 
                    hover:bg-[var(--brand-blue)] hover:text-white 
                    transition"
        >
        {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>
    );
}
