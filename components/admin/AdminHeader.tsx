"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { LogOut, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminHeader() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || 'en';
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check for saved theme preference or default to light mode
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        signOut({ redirect: false }).then(() => {
            router.push(`/${locale}/login`);
        });
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Title */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Admin Dashboard
                        </h1>
                    </div>

                    {/* Right Section: Theme Toggle + User Info + Logout */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>

                        {/* User Info */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                    {session?.user?.username || session?.user?.email || 'Admin'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Admin</span>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

