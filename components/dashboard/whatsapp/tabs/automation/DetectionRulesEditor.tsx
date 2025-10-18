"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface DetectionRule {
    keywords: string[];
    template: string;
    active: boolean;
}

interface Template {
    _id: string;
    name: string;
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
    content?: string;
}

interface DetectionRulesProps {
    rules: DetectionRule[];
    templates: Template[];
    autoReplyActive: boolean;
    onRulesChange: (updated: DetectionRule[]) => void;
}

export default function DetectionRules({
    rules,
    templates,
    autoReplyActive,
    onRulesChange,
    }: DetectionRulesProps) {
    const [newRule, setNewRule] = useState<DetectionRule>({
        keywords: [],
        template: "",
        active: true,
    });
    const [keywordInput, setKeywordInput] = useState("");

    const handleAddKeyword = () => {
        if (!keywordInput.trim()) return;
        setNewRule((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim().toLowerCase()],
        }));
        setKeywordInput("");
    };

    const handleAddRule = () => {
        if (autoReplyActive) {
        toast.error(
            "Auto-Reply is active — disable it to enable detection rules."
        );
        return;
        }
        if (!newRule.template || newRule.keywords.length === 0) {
        toast.error("Please add at least one keyword and select a template.");
        return;
        }

        const updated = [...rules, newRule];
        onRulesChange(updated);
        setNewRule({ keywords: [], template: "", active: true });
        toast.success("Rule added");
    };

    const handleRemoveRule = (index: number) => {
        const updated = rules.filter((_, i) => i !== index);
        onRulesChange(updated);
        toast.success("Rule removed");
    };

    const handleToggleActive = (index: number) => {
        const updated = [...rules];
        updated[index].active = !updated[index].active;
        onRulesChange(updated);
    };

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
        <h3 className="text-white font-semibold">Detection Rules</h3>
        <p className="text-sm text-gray-400">
            Messages containing keywords trigger automatic template responses.
        </p>

        {autoReplyActive && (
            <p className="text-yellow-400 text-sm font-medium">
            ⚠ Auto-Reply is active — detection rules are disabled.
            </p>
        )}

        <div className="flex flex-col md:flex-row gap-2 items-center">
            <input
            type="text"
            placeholder="Add keyword"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-600 text-white"
            disabled={autoReplyActive}
            />
            <button
            onClick={handleAddKeyword}
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white"
            disabled={autoReplyActive}
            >
            + Keyword
            </button>
        </div>

        {newRule.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
            {newRule.keywords.map((kw) => (
                <span
                key={kw}
                className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                >
                {kw}
                </span>
            ))}
            </div>
        )}

        <div>
            <label className="text-white block mb-1">Select Template</label>
            <select
            className="w-full p-2 rounded bg-gray-600 text-white"
            value={newRule.template}
            onChange={(e) =>
                setNewRule((prev) => ({ ...prev, template: e.target.value }))
            }
            disabled={autoReplyActive}
            >
            <option value="">-- Select Template --</option>
            {templates.map((tpl) => (
                <option key={tpl._id} value={tpl.name}>
                {tpl.name}
                </option>
            ))}
            </select>
        </div>

        <button
            onClick={handleAddRule}
            className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-white"
            disabled={autoReplyActive}
        >
            Add Rule
        </button>

        <ul className="space-y-2 mt-4">
            {rules.length === 0 && (
            <li className="text-sm text-gray-400">No detection rules defined.</li>
            )}
            {rules.map((rule, idx) => (
            <li
                key={idx}
                className="flex items-center justify-between bg-gray-600 p-2 rounded"
            >
                <div>
                <p className="text-white font-semibold">
                    {rule.keywords.join(", ")}
                </p>
                <p className="text-gray-300 text-sm">→ {rule.template}</p>
                </div>
                <div className="flex gap-2">
                <button
                    onClick={() => handleToggleActive(idx)}
                    className={`text-xs px-2 py-1 rounded ${
                    rule.active
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-gray-500 hover:bg-gray-400"
                    } text-white`}
                >
                    {rule.active ? "Active" : "Inactive"}
                </button>
                <button
                    onClick={() => handleRemoveRule(idx)}
                    className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white"
                >
                    Remove
                </button>
                </div>
            </li>
            ))}
        </ul>
        </div>
    );
}
