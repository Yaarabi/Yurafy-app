'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface DetectionRule {
    keywords: string[];
    template: string;
    active: boolean;
}

interface Template {
    _id: string;
    name: string;
    type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
    content?: string;
}

interface Props {
    templates: Template[];
    autoReplyActive: boolean;
    onAdd: (rule: DetectionRule) => void;
}

export default function AddDetectionRuleModal({ templates, autoReplyActive, onAdd }: Props) {
    const [open, setOpen] = useState(false);
    const [keywordInput, setKeywordInput] = useState('');
    const [newRule, setNewRule] = useState<DetectionRule>({
        keywords: [],
        template: '',
        active: true,
    });

    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim().toLowerCase();
        if (!trimmed) return;
        if (newRule.keywords.includes(trimmed)) {
        toast.error('Keyword already added.');
        return;
        }
        setNewRule(prev => ({ ...prev, keywords: [...prev.keywords, trimmed] }));
        setKeywordInput('');
    };

    const handleSubmit = () => {
        if (!newRule.template || newRule.keywords.length === 0) {
        toast.error('Please add at least one keyword and select a template.');
        return;
        }

        const ruleToSave = {
        ...newRule,
        active: autoReplyActive ? false : newRule.active,
        };

        onAdd(ruleToSave);
        setNewRule({ keywords: [], template: '', active: true });
        setOpen(false);

        toast.success(
        autoReplyActive
            ? 'Rule created but set inactive (Auto-Reply is active)'
            : 'Rule added successfully!'
        );
    };

    return (
        <>
        {/* Trigger Button */}
        <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm transition-all shadow-sm"
        >
            <Plus size={16} /> Add Detection Rule
        </button>

        {/* Modal */}
        <AnimatePresence>
            {open && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4 relative"
                >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">New Detection Rule</h2>
                    <button
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                    >
                    <X size={18} />
                    </button>
                </div>

                {/* Keyword Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add keyword"
                                        value={keywordInput}
                                        onChange={e => setKeywordInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddKeyword()}
                                        className="flex-1 p-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button
                                        onClick={handleAddKeyword}
                                        className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium text-white transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                {/* Keyword Chips */}
                                {newRule.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {newRule.keywords.map(kw => (
                                            <span key={kw} className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-800 dark:text-gray-100">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                )}

                {/* Template Selector */}
                <div className="pt-2">
                                        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Select Template</label>
                                        <select
                                            value={newRule.template}
                                            onChange={e => setNewRule(prev => ({ ...prev, template: e.target.value }))}
                                            className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                                        >
                    <option value="">-- Select Template --</option>
                    {templates.map(tpl => (
                        <option key={tpl._id} value={tpl.name}>
                        {tpl.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-3">
                                <div className="flex justify-end gap-3 pt-3">
                                    <button onClick={() => setOpen(false)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm text-gray-800 dark:text-gray-100">
                                        Cancel
                                    </button>
                                    <button onClick={handleSubmit} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-medium text-white transition-all">
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
        </>
    );
}
