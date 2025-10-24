
import { useState } from "react";
import toast from "react-hot-toast";

export default function TestPanelTab() {
    const [testMessage, setTestMessage] = useState("");

    const handleSend = async () => {
        try {
        const res = await fetch("/api/whatsapp/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: testMessage }),
        });
        if (!res.ok) throw new Error("Failed to send");
        toast.success("Test message sent");
        } catch (err) {
        toast.error("Sending failed");
        }
    };

    return (
        <div className="space-y-4">
        <label className="block text-gray-800 dark:text-gray-100">Send Test Message</label>
        <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
            placeholder="Type your test message..."
        />
        <button
            onClick={handleSend}
            className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 px-4 py-2 rounded text-white"
        >
            Send Test
        </button>
        </div>
    );
}
