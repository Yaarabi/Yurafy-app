'use client';

import { useState } from 'react';

interface EditableFieldProps {
    label: string;
    value: string;
    onSave: (newValue: string) => void;
}

export default function EditableField({ label, value, onSave }: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(value);

    return (
        <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-200">{label}</label>
        {editing ? (
            <div className="flex gap-2 items-center">
            <input
                className="w-full rounded-md bg-gray-700 text-gray-100 border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button
                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                onClick={() => {
                onSave(input);
                setEditing(false);
                }}
            >
                Save
            </button>
            <button
                className="px-3 py-1 rounded-md bg-gray-500 text-white text-sm hover:bg-gray-600 transition"
                onClick={() => {
                setInput(value); // reset to original
                setEditing(false);
                }}
            >
                Cancel
            </button>
            </div>
        ) : (
            <div className="flex justify-between items-center bg-gray-700 rounded-md px-3 py-2">
            <span className="text-gray-100 text-sm">{value || <em className="text-gray-400">Not set</em>}</span>
            <button
                className="text-blue-400 text-sm hover:text-blue-300 transition"
                onClick={() => setEditing(true)}
            >
                Edit
            </button>
            </div>
        )}
        </div>
    );
}
