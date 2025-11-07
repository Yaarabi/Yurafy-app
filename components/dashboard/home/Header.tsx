
'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import NotificationBell from '../NotificationBell';

export default function DashboardHeader() {
    const t = useTranslations('dashboard.header');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = darkMode ? 'light' : 'dark';
        setDarkMode(!darkMode);
        if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        } else {
        document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
    };

    return (
        <header className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-300 sticky top-0 z-10 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                {/* Heading */}
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 sm:h-8 bg-[var(--brand-blue)] rounded-full"></div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {t('title')}
                    </h1>
                </div>

                {/* Right Section: Notifications + Toggle */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* Dark/Light Toggle */}
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={toggleTheme}
                            className="sr-only"
                        />
                        <div className="relative w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300 group-hover:bg-[var(--brand-blue)]/20 dark:group-hover:bg-[var(--brand-blue)]/30">
                            <div
                                className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                                    darkMode ? 'translate-x-5' : ''
                                }`}
                            />
                        </div>
                        <span className="ml-2 text-gray-600 dark:text-gray-300 group-hover:text-[var(--brand-blue)] transition-colors">
                            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </span>
                    </label>
                </div>
            </div>
        </header>
    );
}
