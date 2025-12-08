"use client";

import { Palette, Sparkles } from "lucide-react";

interface TabNavigationProps {
    activeTab: "theme-select" | "color-customize";
    onTabChange: (tab: "theme-select" | "color-customize") => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 w-full sm:w-auto">
            <button
                type="button"
                onClick={() => onTabChange("theme-select")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${
                    activeTab === "theme-select"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
                <Palette className="w-4 h-4" />
                <span>Choose Theme</span>
            </button>
            <button
                type="button"
                onClick={() => onTabChange("color-customize")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${
                    activeTab === "color-customize"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
                <Sparkles className="w-4 h-4" />
                <span>Customize Colors</span>
            </button>
        </div>
    );
}
