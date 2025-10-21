'use client';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { DetectionRule } from './types';
import TemplateSelector from './TemplateSelector';
import { ITemplate } from '@/models/templates';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface DetectionRuleItemProps {
    rule: DetectionRule;
    index: number;
    templates: ITemplate[];
    onToggle: (index: number, value: boolean) => void;
    onRemove: (index: number) => void;
    onEdit: (index: number, updatedKeywords: string[]) => void; // 🔹 updated
    onTemplateChange: (index: number, templateName: string) => void;
    autoReplyActive: boolean;
}

export default function DetectionRuleItem({
    rule,
    index,
    templates,
    onToggle,
    onRemove,
    onEdit,
    onTemplateChange,
    autoReplyActive,
}: DetectionRuleItemProps) {
    const [editing, setEditing] = useState(false);
    const [keywordInput, setKeywordInput] = useState('');
    const [keywords, setKeywords] = useState(rule.keywords || []);

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (autoReplyActive) {
            toast.error('Detection rules cannot be activated while Auto Reply is enabled.');
            return;
        }
        onToggle(index, e.target.checked);
    };

    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim().toLowerCase();
        if (!trimmed) return;
        if (keywords.includes(trimmed)) {
            toast.error('Keyword already added.');
            return;
        }
        const updated = [...keywords, trimmed];
        setKeywords(updated);
        setKeywordInput('');
        onEdit(index, updated); // 🔹 persist to parent/DB
    };

    const handleRemoveKeyword = (kw: string) => {
        const updated = keywords.filter(k => k !== kw);
        setKeywords(updated);
        onEdit(index, updated);
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {editing ? (
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={e => setKeywordInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddKeyword()}
                                className="p-1 rounded-md bg-gray-700 text-white text-sm flex-1"
                                placeholder="Add keyword"
                            />
                            <button onClick={handleAddKeyword} className="text-sm px-2 py-1 bg-blue-600 rounded-md">Add</button>
                        </div>
                    ) : (
                        <p className="text-white font-semibold tracking-wide">{keywords.join(', ')}</p>
                    )}
                    {keywords.length > 0 && editing && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {keywords.map(kw => (
                                <span key={kw} className="bg-gray-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                    {kw}
                                    <button onClick={() => handleRemoveKeyword(kw)}>x</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditing(prev => !prev)}
                        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white shadow-sm transition"
                        title="Edit Keywords"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={() => onRemove(index)}
                        className="p-2 rounded-lg bg-red-500 hover:bg-red-400 text-white shadow-sm transition"
                        title="Remove Rule"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>

                {/* Toggle */}
                <div className="relative group">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={rule.active}
                            onChange={handleToggle}
                            disabled={autoReplyActive}
                        />
                        <div
                            className={`w-14 h-7 rounded-full transition-colors ${
                                rule.active ? 'bg-green-600' : 'bg-gray-600'
                            } ${autoReplyActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        ></div>
                        <div
                            className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                rule.active ? 'translate-x-7' : ''
                            }`}
                        ></div>
                    </label>
                    {autoReplyActive && (
                        <span className="absolute -top-8 right-0 bg-gray-900 text-gray-200 text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                            Disabled while Auto Reply is active
                        </span>
                    )}
                </div>
            </div>

            {/* Template Selector */}
            <TemplateSelector
                label="Template"
                templates={templates}
                selected={rule.template}
                onChange={(tplName) => onTemplateChange(index, tplName)}
            />
        </>
    );
}
