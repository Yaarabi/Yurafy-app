
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface WhatsAppAccount {
    id: string;
    number: string;
    status: "connected" | "disconnected";
    verified: boolean;
}

export default function ConnectionTab() {
    const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const fetchAccounts = async () => {
        try {
        const res = await fetch("/api/whatsapp/account");
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data = await res.json();
        setAccounts(data.accounts || []);
        } catch (err) {
        console.error(err);
        toast.error("Could not fetch WhatsApp accounts");
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const toggleConnection = async (account: WhatsAppAccount) => {
        setLoadingId(account.id);
        try {
        const res = await fetch(`/api/whatsapp/account/${account.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            status: account.status === "connected" ? "disconnected" : "connected",
            }),
        });

        if (!res.ok) throw new Error("Request failed");

        toast.success(
            account.status === "connected"
            ? "Disconnected successfully"
            : "Connected successfully"
        );
        fetchAccounts();
        } catch (err) {
        console.error(err);
        toast.error("Action failed");
        } finally {
        setLoadingId(null);
        }
    };

    return (
        <div className="space-y-4">
        <p className="text-sm text-gray-300">
            Manage your WhatsApp Business numbers. Connect or disconnect accounts
            below.
        </p>

        <ul className="space-y-3">
            {accounts.map((acc) => (
            <li
                key={acc.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded"
            >
                <div>
                <p className="font-medium">{acc.number}</p>
                <p className="text-xs text-gray-400">
                    {acc.verified ? "Verified" : "Unverified"}
                </p>
                </div>
                <button
                onClick={() => toggleConnection(acc)}
                disabled={loadingId === acc.id}
                className={`px-4 py-1 rounded text-white ${
                    acc.status === "connected"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-green-600 hover:bg-green-500"
                }`}
                >
                {loadingId === acc.id
                    ? "Processing..."
                    : acc.status === "connected"
                    ? "Disconnect"
                    : "Connect"}
                </button>
            </li>
            ))}
        </ul>

        <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white">
            + Add New Number
        </button>
        </div>
    );
}
