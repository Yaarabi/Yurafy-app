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
        <label className="text-white block mb-1">{label}</label>
        <select
            className="w-full p-2 rounded bg-gray-600 text-white"
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
