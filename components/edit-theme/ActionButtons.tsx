"use client";

import { RotateCcw, Save } from "lucide-react";

interface ActionButtonsProps {
    onReset: () => void;
    onSave: () => void;
    saving: boolean;
}

export default function ActionButtons({ onReset, onSave, saving }: ActionButtonsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all text-sm"
            >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
            </button>
            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Design"}</span>
            </button>
        </div>
    );
}
