import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AutomationTab() {
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
    const [greetingTemplate, setGreetingTemplate] = useState("");
    const [orderConfirmEnabled, setOrderConfirmEnabled] = useState(false);
    const [orderTemplate, setOrderTemplate] = useState("");

    useEffect(() => {
        fetch("/api/whatsapp/account")
        .then((res) => res.json())
        .then((data) => {
            setAutoReplyEnabled(Boolean(data.enabled));
            setGreetingTemplate(data.template || "");
            setOrderConfirmEnabled(Boolean(data.orderConfirmEnabled));
            setOrderTemplate(data.orderTemplate || "");
        })
        .catch(() => {});
    }, []);

    const handleSave = async () => {
        try {
        const res = await fetch("/api/whatsapp/account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            enabled: autoReplyEnabled,
            template: greetingTemplate,
            orderConfirmEnabled,
            orderTemplate,
            }),
        });
        if (!res.ok) throw new Error("Failed to save");
        toast.success("Settings updated");
        } catch (err) {
        toast.error("Update failed");
        }
    };

    return (
        <div className="space-y-6">
        {/* Auto Reply */}
        <div className="flex items-center justify-between">
            <label className="text-white">Enable Auto Reply</label>
            <input
            type="checkbox"
            checked={autoReplyEnabled}
            onChange={(e) => setAutoReplyEnabled(e.target.checked)}
            className="toggle toggle-success"
            />
        </div>
        <div>
            <label className="text-white block mb-1">Greeting Message</label>
            <textarea
            className="w-full p-2 rounded bg-gray-600 text-white"
            rows={3}
            value={greetingTemplate}
            onChange={(e) => setGreetingTemplate(e.target.value)}
            placeholder="Hi there! How can I help you today?"
            />
        </div>

        {/* Order Confirmation */}
        <div className="flex items-center justify-between">
            <label className="text-white">Enable Order Confirmation</label>
            <input
            type="checkbox"
            checked={orderConfirmEnabled}
            onChange={(e) => setOrderConfirmEnabled(e.target.checked)}
            className="toggle toggle-success"
            />
        </div>
        <div>
            <label className="text-white block mb-1">Order Confirmation Message</label>
            <textarea
            className="w-full p-2 rounded bg-gray-600 text-white"
            rows={3}
            value={orderTemplate}
            onChange={(e) => setOrderTemplate(e.target.value)}
            placeholder="Thank you for your order! We’ll confirm shortly."
            />
        </div>

        <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
        >
            Save Settings
        </button>
        </div>
    );
}
