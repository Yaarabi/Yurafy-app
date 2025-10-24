'use client';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useWhatsappStore } from "@/lib/zustand/whatsapp/useWhatsappStore"; 

export default function ConnectionTab() {
    const connected = useWhatsappStore((state) => state.connected);
    const setConnected = useWhatsappStore((state) => state.setConnected);
    const [loading, setLoading] = useState(false);

  // Fetch status **only if not loaded**
    useEffect(() => {
        if (connected !== null) return; // already loaded

        const fetchStatus = async () => {
        try {
            const res = await fetch("/api/whatsapp/account");
            if (!res.ok) throw new Error("Failed to fetch account");
            const data = await res.json();

            const isConnected =
            data?.account?.status === "connected" && data?.account?.verified;
            setConnected(isConnected);
        } catch (err) {
            console.error(err);
            toast.error("Could not fetch WhatsApp status");
        }
        };

        fetchStatus();
    }, [connected, setConnected]);

    // Toggle connection
    const toggleConnection = async () => {
        if (connected === null) return;
        setLoading(true);
        try {
        const res = await fetch("/api/whatsapp/account", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            status: connected ? "disconnected" : "connected",
            }),
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();
        const isConnected =
            data?.account?.status === "connected" && data?.account?.verified;
        setConnected(isConnected);

        toast.success(
            isConnected
            ? "WhatsApp connected successfully"
            : "WhatsApp disconnected successfully"
        );
        } catch (err) {
        console.error(err);
        toast.error("Action failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
            Manage your WhatsApp Business connection. Use the switch below to
            activate or deactivate integration.
        </p>

        <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={!!connected}
                disabled={loading || connected === null}
                onChange={toggleConnection}
            />
            <div
                className={`w-14 h-7 rounded-full transition-colors ${
                connected ? "bg-green-600" : "bg-gray-200 dark:bg-gray-600"
                }`}
            ></div>
            <div
                className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                connected ? "translate-x-7" : ""
                }`}
            ></div>
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-300">
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
