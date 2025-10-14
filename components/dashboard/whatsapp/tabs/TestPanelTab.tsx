
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
        <label className="block text-white">Send Test Message</label>
        <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-2 rounded bg-gray-600 text-white"
            placeholder="Type your test message..."
        />
        <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
        >
            Send Test
        </button>
        </div>
    );
}
