"use client";

import VariableDropdown from "./TemplateEditor";

interface NameTypeRowProps {
    name: string;
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
    onNameChange: (value: string) => void;
    onTypeChange: (value: NameTypeRowProps["type"]) => void;
    onInsertVariable: (key: string) => void;
}

export default function NameTypeRow({ name, type, onNameChange, onTypeChange, onInsertVariable }: NameTypeRowProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <input
                type="text"
                placeholder="Template Name"
                className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
            />

            <select
                value={type}
                onChange={(e) => onTypeChange(e.target.value as NameTypeRowProps["type"])}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded"
            >
                <option value="TEXT">Text</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="DOCUMENT">Document</option>
            </select>

            <VariableDropdown onSelect={onInsertVariable} />
        </div>
    );
}
