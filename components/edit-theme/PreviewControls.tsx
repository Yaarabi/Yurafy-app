"use client";

import { Eye, EyeOff, MonitorSmartphone } from "lucide-react";

interface PreviewControlsProps {
    previewPage: "STORE_PAGE" | "PRODUCT_PAGE";
    showColorControls: boolean;
    onPageChange: (page: "STORE_PAGE" | "PRODUCT_PAGE") => void;
    onToggleControls: () => void;
}

export default function PreviewControls({
    previewPage,
    showColorControls,
    onPageChange,
    onToggleControls,
}: PreviewControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MonitorSmartphone className="w-5 h-5 text-indigo-600" />
                Live Preview
            </h2>

            <div className="flex flex-col xs:flex-row gap-2">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => onPageChange("STORE_PAGE")}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                            previewPage === "STORE_PAGE"
                                ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                    >
                        Store
                    </button>
                    <button
                        type="button"
                        onClick={() => onPageChange("PRODUCT_PAGE")}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                            previewPage === "PRODUCT_PAGE"
                                ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                    >
                        Product
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onToggleControls}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 active:scale-95 transition-all"
                >
                    {showColorControls ? (
                        <>
                            <EyeOff className="w-4 h-4" />
                            <span className="hidden sm:inline">Hide</span>
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Show</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
