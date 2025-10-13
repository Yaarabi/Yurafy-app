
"use client";
import React from "react";

interface Props {
    template: string;
    onChange: (value: string) => void;
}

export default function TemplateEditor({ template, onChange }: Props) {
    return (
        <div className="mb-6">
        <label className="block text-lg text-gray-700 dark:text-gray-300 mb-2">Auto-Reply Template:</label>
        <textarea
            value={template}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Type your auto-reply message here..."
        />
        </div>
    );
}
