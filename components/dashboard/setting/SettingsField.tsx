'use client';

import { useState, useEffect } from 'react';

interface EditableFieldProps {
    label: string;
    value: string;
    onSave: (newValue: string) => void;
}

export default function EditableField({ label, value, onSave }: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(value);
    const [saving, setSaving] = useState(false);

    // Sync input with value prop when value changes externally
    useEffect(() => {
        setInput(value);
    }, [value]);

    const handleSave = async () => {
        if (input === value) {
            setEditing(false);
            return;
        }
        setSaving(true);
        try {
            await onSave(input);
            setEditing(false);
        } catch (error) {
            // Error handling is done by parent component
            setInput(value); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setInput(value); // reset to original
        setEditing(false);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
            {editing ? (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <input
                        className="flex-1 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                        disabled={saving}
                    />
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSave}
                            disabled={saving || input === value}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2 min-h-[40px]">
                    <span className="text-gray-800 dark:text-gray-100 text-sm flex-1 truncate">
                        {value || <em className="text-gray-500 dark:text-gray-400">Not set</em>}
                    </span>
                    <button
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:opacity-80 transition ml-2 flex-shrink-0"
                        onClick={() => setEditing(true)}
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
}
