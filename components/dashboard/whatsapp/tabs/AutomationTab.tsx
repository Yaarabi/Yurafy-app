"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Settings {
    autoReply: boolean;
    orderConfirmation: boolean;
    aiAgent: boolean;
}

interface Template {
    _id: string;
    name: string;
    content: string;
}

interface KeywordRule {
    keyword: string;
    response: string;
}

export default function AutomationTab() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [settings, setSettings] = useState<Settings>({
        autoReply: false,
        orderConfirmation: false,
        aiAgent: false,
    });

    const [selectedGreeting, setSelectedGreeting] = useState<string>("");
    const [selectedOrderConfirmation, setSelectedOrderConfirmation] = useState<string>("");
    const [selectedFallback, setSelectedFallback] = useState<string>("");

    const [rules, setRules] = useState<KeywordRule[]>([]);
    const [newRule, setNewRule] = useState<KeywordRule>({
        keyword: "",
        response: "",
    });

    const [templates, setTemplates] = useState<Template[]>([]);

    const fetchSettings = async () => {
        setFetching(true);
        try {
        const [accountRes, templatesRes] = await Promise.all([
            fetch("/api/whatsapp/account", { cache: "no-store" }),
            fetch("/api/whatsapp/templates", { cache: "no-store" }),
        ]);

        if (!accountRes.ok || !templatesRes.ok)
            throw new Error("Failed to fetch");

        const accountData = await accountRes.json();
        const templatesData = await templatesRes.json();

        setSettings(accountData.account.settings || {});
        setRules(accountData.account.rules || []);

        const safeTemplates = Array.isArray(templatesData.templates)
            ? templatesData.templates
            : [];
        setTemplates(safeTemplates);

        // pre-fill template names
        setSelectedGreeting(
            accountData.account.preferredTemplates?.greeting || ""
        );
        setSelectedOrderConfirmation(
            accountData.account.preferredTemplates?.orderConfirmation || ""
        );
        setSelectedFallback(
            accountData.account.preferredTemplates?.fallback || ""
        );
        } catch (err) {
        console.error(err);
        toast.error("Could not load automation settings");
        } finally {
        setFetching(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const autoPatch = async (payload: object) => {
    try {
        const res = await fetch("/api/whatsapp/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
        toast.error(data.error || "Update failed");
        throw new Error(data.error || "Update failed");
        } else {
        toast.success("Updated successfully");
        }
    } catch (err) {
        console.error(err);
        toast.error("Update failed");
    }
    };


    const handleSettingChange = (field: keyof Settings, value: boolean) => {
        const newSettings = { ...settings, [field]: value };
        setSettings(newSettings);
        autoPatch({ settings: newSettings });
    };

    const handleTemplateChange = (
        field: "greeting" | "orderConfirmation" | "fallback",
        value: string
    ) => {
        if (field === "greeting") setSelectedGreeting(value);
        else if (field === "orderConfirmation") setSelectedOrderConfirmation(value);
        else setSelectedFallback(value);

        autoPatch({ preferredTemplates: { [field]: value } });
    };

    const addRule = () => {
        if (!newRule.keyword.trim() || !newRule.response.trim()) {
        toast.error("Keyword and response required");
        return;
        }
        const updatedRules = [...rules, newRule];
        setRules(updatedRules);
        setNewRule({ keyword: "", response: "" });
        autoPatch({ rules: updatedRules });
    };

    const removeRule = (idx: number) => {
        const updatedRules = rules.filter((_, i) => i !== idx);
        setRules(updatedRules);
        autoPatch({ rules: updatedRules });
    };

    if (fetching) {
        return <p className="text-gray-400 text-center">Loading settings...</p>;
    }

    const renderTemplateSelect = (
        label: string,
        selected: string,
        field: "greeting" | "orderConfirmation" | "fallback"
    ) => (
        <div className="space-y-1">
        <label className="text-white block mb-1">{label}</label>
        <select
            className="w-full p-2 rounded bg-gray-600 text-white"
            value={selected}
            onChange={(e) => handleTemplateChange(field, e.target.value)}
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

    return (
        <div className="space-y-6">
        {/* Auto Reply */}
        <div className="bg-gray-700 p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
            <label className="text-white font-medium">Enable Auto Reply</label>
            <input
                type="checkbox"
                checked={settings.autoReply}
                onChange={(e) => handleSettingChange("autoReply", e.target.checked)}
                disabled={loading}
            />
            </div>
            {renderTemplateSelect("Greeting Template", selectedGreeting, "greeting")}
        </div>

        {/* Order Confirmation */}
        <div className="bg-gray-700 p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
            <label className="text-white font-medium">
                Enable Order Confirmation
            </label>
            <input
                type="checkbox"
                checked={settings.orderConfirmation}
                onChange={(e) =>
                handleSettingChange("orderConfirmation", e.target.checked)
                }
                disabled={loading}
            />
            </div>
            {renderTemplateSelect(
            "Order Confirmation Template",
            selectedOrderConfirmation,
            "orderConfirmation"
            )}
        </div>

        {/* Fallback */}
        <div className="bg-gray-700 p-4 rounded space-y-3">
            {renderTemplateSelect("Fallback Template", selectedFallback, "fallback")}
        </div>

        {/* AI Agent */}
        <div className="bg-gray-700 p-4 rounded flex items-center justify-between">
            <label className="text-white font-medium">
            Enable AI WhatsApp Agent
            </label>
            <input
            type="checkbox"
            checked={settings.aiAgent}
            onChange={(e) => handleSettingChange("aiAgent", e.target.checked)}
            disabled={loading}
            />
        </div>

        {/* Keyword Rules */}
        <div className="bg-gray-700 p-4 rounded space-y-3">
            <h3 className="text-white font-semibold">Keyword Auto-Replies</h3>
            <p className="text-sm text-gray-400">
            Define keywords and their automatic responses. When a customer’s
            message contains the keyword, the response will be sent.
            </p>

            <div className="flex flex-col md:flex-row gap-2">
            <input
                type="text"
                placeholder="Keyword"
                className="flex-1 p-2 rounded bg-gray-600 text-white"
                value={newRule.keyword}
                onChange={(e) =>
                setNewRule({ ...newRule, keyword: e.target.value })
                }
            />
            <input
                type="text"
                placeholder="Response"
                className="flex-1 p-2 rounded bg-gray-600 text-white"
                value={newRule.response}
                onChange={(e) =>
                setNewRule({ ...newRule, response: e.target.value })
                }
            />
            <button
                onClick={addRule}
                className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-white"
            >
                Add
            </button>
            </div>

            <ul className="space-y-2 mt-3">
            {rules.length === 0 && (
                <li className="text-sm text-gray-400">No rules defined yet.</li>
            )}
            {rules.map((rule, idx) => (
                <li
                key={idx}
                className="flex items-center justify-between bg-gray-600 p-2 rounded"
                >
                <div>
                    <span className="font-semibold text-white">{rule.keyword}</span>
                    <span className="text-gray-300 text-sm ml-2">
                    → {rule.response}
                    </span>
                </div>
                <button
                    onClick={() => removeRule(idx)}
                    className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white"
                >
                    Remove
                </button>
                </li>
            ))}
            </ul>
        </div>
        </div>
    );
}
