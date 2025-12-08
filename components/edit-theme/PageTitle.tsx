"use client";

import { Sparkles } from "lucide-react";

export default function PageTitle() {
    return (
        <div>
            <p className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                Theme Customization
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Design Your Store
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                Select a theme, customize colors, and preview your store in real-time.
            </p>
        </div>
    );
}
