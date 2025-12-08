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
        return () => {
            const root = document.documentElement;
            root.classList.remove('dark');
            root.removeAttribute('style');
            root.removeAttribute('data-theme');
        };
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
        <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-16">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-2.5">
                            <div className="relative flex-shrink-0">
                                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white text-sm md:text-base font-bold shadow-md ring-2 ring-indigo-200/60 dark:ring-indigo-800/60">
                                    {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm ring-1 ring-emerald-400/50"></div>
                            </div>
                            <div className="hidden sm:flex flex-col min-w-0">
                                <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-white leading-tight truncate">
                                    {session?.user?.username || session?.user?.email?.split('@')[0] || 'Admin'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <button
                            onClick={toggleTheme}
                            className="relative p-2.5 md:p-3 dark:hover:bg-gray-800/60 transition-all duration-200 group active:scale-95 shadow-sm hover:shadow-md"
                            aria-label="Toggle theme"
                        >
                            <div className="relative w-5 h-5 md:w-6 md:h-6">
                                {darkMode ? (
                                    <Sun className="w-full h-full text-amber-500 dark:text-amber-400 transition-all duration-300 group-hover:rotate-180 group-hover:scale-110" />
                                ) : (
                                    <Moon className="w-full h-full text-slate-600 dark:text-slate-400 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                                )}
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="group relative p-2.5 md:p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 border border-transparent hover:border-red-200/60 dark:hover:border-red-800/60 active:scale-95"
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:scale-110" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

