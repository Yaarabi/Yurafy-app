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
            className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-blue/50 dark:focus:ring-brand-blue/40 outline-none transition-all hover:border-gray-300 dark:hover:border-gray-500"
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
