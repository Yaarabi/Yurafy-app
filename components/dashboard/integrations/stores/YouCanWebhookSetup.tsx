"use client";

import React, { useEffect, useState } from "react";
import CopyButton from "../../../common/CopyButton";
import Alert from "../../../common/Alert";
import StatusBadge from "../../../common/StatusBadge";
import Spinner from "../../../common/Spinner";

type Store = {
    _id: string;
    owner: string;
    token: string;
    connect: boolean;
    accessToken?: string;
    subscriptionId?: string;
};

export default function YouCanWebhookSetup({ onClose }: { onClose?: () => void }) {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    // Fetch current store connection
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch("/api/webhooks/youcan/store")
        .then(async (res) => {
            if (!res.ok) {
            if (mounted) setStore(null);
            return;
            }
            const data = await res.json();
            if (mounted) setStore(data.store || null);
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false));
        return () => {
        mounted = false;
        };
    }, []);

    // OAuth connect
    function handleConnect() {
        window.location.href = "/api/youcan/connect";
    }

    // Disconnect store
    async function handleDisconnect() {
        if (!store) return;
        setLoading(true);
        try {
        const res = await fetch("/api/webhooks/youcan/store", { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to disconnect");
        setStore(null);
        setSuccess("Disconnected successfully");
        } catch (err: any) {
        setError(err.message || String(err));
        } finally {
        setLoading(false);
        }
    }

    // Refresh store info
    async function handleRefresh() {
        setLoading(true);
        try {
        const res = await fetch("/api/webhooks/youcan/store");
        if (!res.ok) {
            setStore(null);
            return;
        }
        const data = await res.json();
        setStore(data.store || null);
        } catch (err: any) {
        setError(String(err));
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose && onClose()} />
        <div className="relative max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-center -mt-6 mb-3">
            <div
                className="w-16 h-16 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(180deg,#fff7ed 0%, #fffbf0 100%)" }}
            >
                <img
                src="https://khamsat.hsoubcdn.com/images/services/2777808/df2fd04728e150af95fbc868ac35135d.jpg"
                alt="YouCan"
                className="w-9 h-9 object-contain"
                />
            </div>
            </div>

            <div className="text-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">YouCan Integration</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Connect your YouCan store so Yurafy can register webhooks and import orders.
            </p>
            <div className="mt-2">
                <StatusBadge connected={!!store?.connect} />
            </div>
            </div>

            {error && (
            <div className="mb-3">
                <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
            )}
            {success && (
            <div className="mb-3">
                <Alert type="success" message={success} onClose={() => setSuccess(null)} />
            </div>
            )}

            {store?.token && (
            <div className="mt-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400">Webhook token</label>
                <div className="mt-2 flex gap-2 items-center">
                <input
                    readOnly
                    value={store.token}
                    aria-label="YouCan webhook token"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]"
                />
                <CopyButton value={store.token} label="Copy webhook token" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                Copy the token if you need to paste it into the YouCan portal directly.
                </p>
            </div>
            )}

            {store?.subscriptionId && (
            <div className="mt-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400">Subscription ID</label>
                <div className="mt-2 flex gap-2 items-center">
                <input
                    readOnly
                    value={store.subscriptionId}
                    aria-label="YouCan subscription id"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]"
                />
                <CopyButton value={store.subscriptionId} label="Copy subscription id" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                This ID identifies the RESThook subscription in YouCan.
                </p>
            </div>
            )}

            <div className="mt-4 flex gap-2">
            {!store?.connect && (
                <button
                className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-md inline-flex items-center"
                onClick={handleConnect}
                disabled={loading}
                aria-label="Connect YouCan"
                >
                {loading ? (
                    <>
                    <Spinner />
                    Connecting...
                    </>
                ) : (
                    "Connect YouCan"
                )}
                </button>
            )}

            {store?.connect && (
                <>
                <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md inline-flex items-center"
                    onClick={handleDisconnect}
                    disabled={loading}
                    aria-label="Disconnect YouCan"
                >
                    {loading ? (
                    <>
                        <Spinner />
                        Disconnecting...
                    </>
                    ) : (
                    "Disconnect"
                    )}
                </button>
                <button
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md"
                    onClick={handleRefresh}
                    aria-label="Refresh status"
                >
                    Refresh
                </button>
                </>
            )}

            <button
                className="ml-auto px-3 py-2 rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]"
                onClick={() => onClose && onClose()}
                aria-label="Close"
            >
                Close
            </button>
            </div>

            <div className="mt-4">
            <button
                aria-expanded={showInstructions}
                aria-controls="youcan-instructions"
                onClick={() => setShowInstructions((s) => !s)}
                className="text-sm text-[var(--brand-blue)] underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]"
            >
                {showInstructions ? "Hide instructions" : "Show instructions"}
            </button>
            {showInstructions && (
                <div id="youcan-instructions" className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                <ol className="list-decimal list-inside space-y-2">
                    <li>
                    <strong>Open</strong> the YouCan Developer Portal and navigate to Webhooks.
                    </li>
                    <li>
                    <strong>Click</strong> Connect above to authorize Yurafy to manage webhooks for your store.
                    </li>
                    <li>
                    <strong>Yurafy</strong> will automatically register the webhook and create the subscription; you can copy the{" "}
                    <em>Webhook token</em> below if you need it.
                    </li>
                    <li>
                    <strong>Ensure</strong> order.created events are enabled in your store if required.
                    </li>
                </ol>
                <p className="mt-2 text-xs text-gray-500">
                    If you rotate the client secret, update it here and re-save the webhook in YouCan.
                </p>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}
