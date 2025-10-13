
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import BotStatusToggle from "./BotStatusToggle";
import TemplateEditor from "./TemplateEditor";

export default function BotSettingsForm() {
    const [enabled, setEnabled] = useState(false);
    const [template, setTemplate] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
        const res = await axios.get("/api/whatsapp/bot-settings");
        setEnabled(res.data.enabled);
        setTemplate(res.data.template);
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        await axios.post("/api/whatsapp/bot-settings", { enabled, template });
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">🤖 WhatsApp Bot Settings</h2>
        <BotStatusToggle enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <TemplateEditor template={template} onChange={setTemplate} />
        <div className="flex justify-end">
            <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium"
            >
            {loading ? "Saving..." : "Save Settings"}
            </button>
        </div>
        {saved && <p className="mt-4 text-green-500 text-sm font-medium">✅ Settings saved successfully!</p>}
        </div>
    );
}
