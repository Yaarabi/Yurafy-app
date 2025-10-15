"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AutomationTab() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [settings, setSettings] = useState({
        autoReply: false,
        orderConfirmation: false,
        aiAgent: false,
    });

    const [templates, setTemplates] = useState({
        greeting: "",
        orderConfirmation: "",
        fallback: "",
    });

    // Fetch settings from backend
    const fetchSettings = async () => {
        setFetching(true);
        try {
        const res = await fetch("/api/whatsapp/account", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        // console.log(data.account.settings)

        setSettings(data.account.settings || {});
        setTemplates(data.account.templates || {});
        } catch (err) {
        console.error(err);
        toast.error("Could not load automation settings");
        } finally {
        setFetching(false);
        }
    };

    // 🔁 Re-fetch when user navigates back or refocuses tab
    useEffect(() => {
        fetchSettings();

        const handleVisibility = () => {
        if (document.visibilityState === "visible") fetchSettings();
        };
        window.addEventListener("visibilitychange", handleVisibility);
        return () => window.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    // Save updated settings
    const handleSave = async () => {
        setLoading(true);
        try {
        const res = await fetch("/api/whatsapp/account", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settings, templates }),
        });

        if (!res.ok) throw new Error("Failed to save");

        toast.success("Automation settings updated");
        await fetchSettings(); // 🔄 immediately refresh after save
        } catch (err) {
        console.error(err);
        toast.error("Update failed");
        } finally {
        setLoading(false);
        }
    };

    if (fetching)
        return <p className="text-gray-400 text-center">Loading settings...</p>;

    return (
        <div className="space-y-6">
        {/* Auto Reply */}
        <div className="flex items-center justify-between">
            <label className="text-white">Enable Auto Reply</label>
            <input
            type="checkbox"
            checked={settings.autoReply}
            onChange={(e) =>
                setSettings({ ...settings, autoReply: e.target.checked })
            }
            className="toggle toggle-success"
            disabled={loading}
            />
        </div>
        <div>
            <label className="text-white block mb-1">Greeting Message</label>
            <textarea
            className="w-full p-2 rounded bg-gray-600 text-white"
            rows={3}
            value={templates.greeting}
            onChange={(e) =>
                setTemplates({ ...templates, greeting: e.target.value })
            }
            placeholder="Hi there! How can I help you today?"
            />
        </div>

        {/* Order Confirmation */}
        <div className="flex items-center justify-between">
            <label className="text-white">Enable Order Confirmation</label>
            <input
            type="checkbox"
            checked={settings.orderConfirmation}
            onChange={(e) =>
                setSettings({
                ...settings,
                orderConfirmation: e.target.checked,
                })
            }
            className="toggle toggle-success"
            disabled={loading}
            />
        </div>
        <div>
            <label className="text-white block mb-1">Order Confirmation Message</label>
            <textarea
            className="w-full p-2 rounded bg-gray-600 text-white"
            rows={3}
            value={templates.orderConfirmation}
            onChange={(e) =>
                setTemplates({
                ...templates,
                orderConfirmation: e.target.value,
                })
            }
            placeholder="Thank you for your order! We’ll confirm shortly."
            />
        </div>

        {/* AI Agent */}
        <div className="flex items-center justify-between">
            <label className="text-white">Enable AI WhatsApp Agent</label>
            <input
            type="checkbox"
            checked={settings.aiAgent}
            onChange={(e) =>
                setSettings({ ...settings, aiAgent: e.target.checked })
            }
            className="toggle toggle-success"
            disabled={loading}
            />
        </div>

        <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
        >
            {loading ? "Saving..." : "Save Settings"}
        </button>
        </div>
    );
}
