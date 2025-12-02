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
}: DetectionRuleItemProps) {
    const [editing, setEditing] = useState(false);
    const [keywordInput, setKeywordInput] = useState('');
    const [keywords, setKeywords] = useState(rule.keywords || []);

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow toggling regardless of Auto Reply state
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
                                className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm flex-1 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-blue/50 dark:focus:ring-brand-blue/40 outline-none transition-all hover:border-gray-300 dark:hover:border-gray-500"
                                placeholder="Add keyword"
                            />
                            <button onClick={handleAddKeyword} className="text-sm px-2 py-1 bg-brand-blue hover:opacity-90 text-white rounded-md">Add</button>
                        </div>
                    ) : (
                        <p className="text-gray-800 dark:text-white font-semibold tracking-wide">{keywords.join(', ')}</p>
                    )}
                    {keywords.length > 0 && editing && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {keywords.map(kw => (
                                <span key={kw} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 text-gray-800 dark:text-gray-100">
                                    {kw}
                                    <button onClick={() => handleRemoveKeyword(kw)} className="ml-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditing(prev => !prev)}
                        className="p-2 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        title="Edit Keywords"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={() => onRemove(index)}
                        className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
                        />
                        <div
                            className={`w-14 h-7 rounded-full transition-colors ${
                                rule.active ? 'bg-green-600' : 'bg-gray-600'
                            }`}
                        ></div>
                        <div
                            className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                rule.active ? 'translate-x-7' : ''
                            }`}
                        ></div>
                    </label>
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
