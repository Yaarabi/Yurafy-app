"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DetectionRules from "./DetectionRulesEditor";
import TemplateSelector from "./TemplateSelector";
import { ITemplate } from "@/models/templates";

interface Settings {
    autoReply: boolean;
    orderConfirmation: boolean;
    aiAgent: boolean;
    ad: boolean;
}


interface DetectionRule {
    keywords: string[];
    template: string;
    active: boolean;
}

export default function AutomationTab() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState<Settings>({
        autoReply: false,
        orderConfirmation: false,
        aiAgent: false,
        ad: false,
    });
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState({
        greeting: "",
        orderConfirmation: "",
        ad: "",
    });
    const [rules, setRules] = useState<DetectionRule[]>([]);

    // Fetch initial data
    const fetchSettings = async () => {
        setFetching(true);
        try {
        const [accountRes, templatesRes] = await Promise.all([
            fetch("/api/whatsapp/account", { cache: "no-store" }),
            fetch("/api/whatsapp/templates", { cache: "no-store" }),
        ]);

        if (!accountRes.ok || !templatesRes.ok) throw new Error("Failed to fetch");

        const accountData = await accountRes.json();
        const templatesData = await templatesRes.json();

        setTemplates(templatesData.templates || []);
        setSettings(accountData.account.settings || {});
        setRules(accountData.account.detectionRules || []);
        setSelectedTemplates({
            greeting: accountData.account.preferredTemplates?.greeting || "",
            orderConfirmation: accountData.account.preferredTemplates?.orderConfirmation || "",
            ad: accountData.account.preferredTemplates?.ad || "",
        });
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
        if (!res.ok) throw new Error(data.error || "Update failed");
        toast.success("Updated successfully");
        } catch (err) {
        console.error(err);
        toast.error("Update failed");
        }
    };

    const handleSettingChange = (field: keyof Settings, value: boolean) => {
        const newSettings = { ...settings, [field]: value };
        setSettings(newSettings);

        // If Auto-Reply activated, deactivate detection rules
        if (field === "autoReply" && value) setRules((prev) => prev.map((r) => ({ ...r, active: false })));

        autoPatch({ settings: newSettings, detectionRules: rules });
    };

    const handleTemplateChange = (field: "greeting" | "orderConfirmation" | "ad", value: string) => {
        setSelectedTemplates((prev) => ({ ...prev, [field]: value }));
        autoPatch({ preferredTemplates: { [field]: value } });
    };

    const handleRulesChange = (updated: DetectionRule[]) => {
        setRules(updated);
        autoPatch({ detectionRules: updated });
    };

    if (fetching) return <p className="text-gray-400 text-center">Loading settings...</p>;

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
            <TemplateSelector
            label="Greeting Template"
            templates={templates}
            selected={selectedTemplates.greeting}
            onChange={(value) => handleTemplateChange("greeting", value)}
            />
        </div>

        {/* Order Confirmation */}
        <div className="bg-gray-700 p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
            <label className="text-white font-medium">Enable Order Confirmation</label>
            <input
                type="checkbox"
                checked={settings.orderConfirmation}
                onChange={(e) => handleSettingChange("orderConfirmation", e.target.checked)}
                disabled={loading}
            />
            </div>
            <TemplateSelector
            label="Order Confirmation Template"
            templates={templates}
            selected={selectedTemplates.orderConfirmation}
            onChange={(value) => handleTemplateChange("orderConfirmation", value)}
            />
        </div>

        {/* Ad Template */}
        <div className="bg-gray-700 p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
            <label className="text-white font-medium">Enable Ad Template</label>
            <input
                type="checkbox"
                checked={settings.ad}
                onChange={(e) => handleSettingChange("ad", e.target.checked)}
                disabled={loading}
            />
            </div>
            <TemplateSelector
            label="Ad Template"
            templates={templates}
            selected={selectedTemplates.ad}
            onChange={(value) => handleTemplateChange("ad", value)}
            />
        </div>

        {/* AI Agent */}
        <div className="bg-gray-700 p-4 rounded flex items-center justify-between">
            <label className="text-white font-medium">Enable AI WhatsApp Agent</label>
            <input
            type="checkbox"
            checked={settings.aiAgent}
            onChange={(e) => handleSettingChange("aiAgent", e.target.checked)}
            disabled={loading}
            />
        </div>

        {/* Detection Rules */}
        <DetectionRules
            rules={rules}
            templates={templates}
            autoReplyActive={settings.autoReply}
            onRulesChange={handleRulesChange}
        />
        </div>
    );
}
