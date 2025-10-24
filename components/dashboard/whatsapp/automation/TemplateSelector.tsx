"use client";

import { ITemplate } from "@/models/templates";

interface TemplateSelectorProps {
    label: string;
    templates: ITemplate[];
    selected: string;
    onChange: (name: string) => void;
}

export default function TemplateSelector({
    label,
    templates,
    selected,
    onChange,
    }: TemplateSelectorProps) {
    return (
        <div className="space-y-1">
        <label className="text-gray-800 dark:text-white block mb-1">{label}</label>
        <select
            className="w-full p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none"
            value={selected}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">-- Select Template --</option>
            {templates.map((tpl) => (
            <option key={tpl._id} value={tpl.name}>
                {tpl.name}
            </option>
            ))}
        </select>
        </div>
    );
}
