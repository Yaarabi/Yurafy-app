"use client";

import { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";
import AddTemplate from "./AddTemplate";
import TemplateList, { TemplateListRef } from "./TemplateList";

export default function TemplatesTab() {
    const [showAdd, setShowAdd] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const templateListRef = useRef<TemplateListRef>(null);

    const handleRefresh = async () => {
        if (templateListRef.current) {
            setRefreshing(true);
            try {
                await templateListRef.current.refresh();
            } finally {
                setRefreshing(false);
            }
        }
    };

    return (
        <div className="relative space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Templates</h2>
            <div className="flex gap-2">
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded shadow transition"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
                <button
                onClick={() => setShowAdd(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition"
                >
                + Add Template
                </button>
            </div>
        </div>

        {/* Template List */}
        <TemplateList ref={templateListRef} />

        {/* Absolute AddTemplate overlay */}
        {showAdd && (
            <div className="absolute inset-0 flex items-start justify-center z-50">
                <div className="relative w-full max-w-lg mt-10">
                    <AddTemplate 
                        onSuccess={async () => {
                            // Refresh templates list after successful creation
                            if (templateListRef.current) {
                                await templateListRef.current.refresh();
                            }
                        }}
                        onClose={() => setShowAdd(false)}
                    />
                    <button
                    onClick={() => setShowAdd(false)}
                    className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow"
                    >
                    ✕
                    </button>
                </div>
            </div>
        )}
        </div>
    );
}
