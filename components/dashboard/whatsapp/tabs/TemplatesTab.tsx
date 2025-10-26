"use client";

import { useState } from "react";
import AddTemplate from "./AddTemplate";
import TemplateList from "./TemplateList";

export default function TemplatesTab() {
    const [showAdd, setShowAdd] = useState(false);

    return (
        <div className="relative space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Templates</h2>
            <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition"
            >
            + Add Template
            </button>
        </div>

        {/* Template List */}
        <TemplateList />

        {/* Absolute AddTemplate overlay */}
        {showAdd && (
            <div className="absolute inset-0 flex items-start justify-center z-50">
                <div className="relative w-full max-w-lg mt-10">
                    <AddTemplate />
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
