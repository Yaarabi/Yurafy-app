import React, { type ComponentType, type SVGProps } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableFieldProps {
    field: string;
    label: string;
    value: string | number | null | undefined;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    isEditing: boolean;
    editValue: string;
    onStartEdit: (field: string, value: string | number | null | undefined) => void;
    onSave: (field: string) => void;
    onCancel: () => void;
    onChange: (value: string) => void;
    type?: string;
    multiline?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
    field,
    label,
    value,
    icon: Icon,
    isEditing,
    editValue,
    onStartEdit,
    onSave,
    onCancel,
    onChange,
    type = 'text',
    multiline = false,
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(event.target.value);
    };

    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';

    return (
        <div className="rounded-xl border border-gray-200 bg-white/95 p-3 transition-colors hover:border-indigo-300 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Icon className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                    <span className="truncate text-sm font-semibold text-gray-700">{label}</span>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => onStartEdit(field, value)}
                        className="flex-shrink-0 rounded-lg p-2 transition-all touch-manipulation hover:bg-indigo-50 active:scale-95"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4 text-indigo-600" />
                    </button>
                )}
            </div>
            {isEditing ? (
                <div className="space-y-2">
                    {multiline ? (
                        <textarea
                            value={editValue}
                            onChange={handleChange}
                            className="w-full resize-none rounded-lg border border-indigo-300 p-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            autoFocus
                        />
                    ) : (
                        <input
                            type={type}
                            value={editValue}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-indigo-300 p-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                        />
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSave(field)}
                            className="flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-all touch-manipulation hover:bg-indigo-700 active:scale-95 sm:py-2"
                        >
                            <Check className="h-3 w-3" />
                            Save
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 transition-all touch-manipulation hover:bg-gray-300 active:scale-95 sm:py-2"
                        >
                            <X className="h-3 w-3" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="break-words text-sm text-gray-900">
                    {hasValue ? value : <span className="text-gray-400 italic">Not set</span>}
                </p>
            )}
        </div>
    );
};

export default EditableField;
