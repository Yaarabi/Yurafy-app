import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ConnectionTab() {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch initial state from backend
    useEffect(() => {
        fetch("/api/whatsapp/account")
        .then((res) => res.json())
        .then((data) => setConnected(Boolean(data?.enabled)))
        .catch(() => {});
    }, []);

    const toggleConnection = async () => {
        setLoading(true);
        try {
        const endpoint = connected
            ? "/api/whatsapp/disconnect"
            : "/api/whatsapp/connect";

        const res = await fetch(endpoint, { method: "POST" });
        if (!res.ok) throw new Error("Request failed");

        setConnected(!connected);
        toast.success(
            connected ? "Disconnected successfully" : "Connected successfully"
        );
        } catch (err) {
        toast.error("Action failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
        <p className="text-sm text-gray-300">
            Manage your WhatsApp Business connection. Use the switch below to
            activate or deactivate integration.
        </p>

        <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={connected}
                disabled={loading}
                onChange={toggleConnection}
            />
            <div
                className={`w-14 h-7 rounded-full transition-colors ${
                connected
                    ? "bg-green-600 peer-checked:bg-green-600"
                    : "bg-gray-600 peer"
                }`}
            ></div>
            <div
                className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                connected ? "translate-x-7" : ""
                }`}
            ></div>
            </label>
            <span className="text-sm text-gray-200">
            {loading
                ? "Processing..."
                : connected
                ? "WhatsApp Connected"
                : "WhatsApp Disconnected"}
            </span>
        </div>

        <div className="text-xs text-gray-400 mt-2">
            Need help? Follow our{" "}
            <a href="#" className="underline text-blue-400">
            integration guide
            </a>
            .
        </div>
        </div>
    );
}
