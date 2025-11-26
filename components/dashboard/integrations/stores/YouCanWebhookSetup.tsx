"use client";

import React, { useEffect, useState } from "react";

type Store = { _id: string; owner: string; token: string; connect: boolean; accessToken?: string; subscriptionId?: string };

function CopyButton({ value, label, className }: { value?: string; label?: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    async function doCopy() {
        if (!value) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(value);
            else {
                const ta = document.createElement('textarea');
                ta.value = value;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (e) { console.error('Copy failed', e); }
    }
    return (
        <button
            onClick={doCopy}
            disabled={!value}
            aria-label={label || 'Copy'}
            className={`${className || 'px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm'} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]`}
        >
            {copied ? 'Copied!' : (label || 'Copy')}
        </button>
    );
}

// Small reusable Alert component
function Alert({ type, message, onClose }: { type: 'error' | 'success'; message: string; onClose?: () => void }) {
    useEffect(() => {
        const id = setTimeout(() => onClose && onClose(), 4500);
        return () => clearTimeout(id);
    }, [onClose]);

    const base = 'p-3 rounded-md flex items-start gap-3';
    const cls = type === 'error' ? `${base} bg-red-50 text-red-800 border border-red-100` : `${base} bg-green-50 text-green-800 border border-green-100`;

    return (
        <div role="alert" className={cls}>
            <div className="flex-1 text-sm">{message}</div>
            <button aria-label="Dismiss alert" onClick={() => onClose && onClose()} className="text-sm opacity-80 hover:opacity-100">✕</button>
        </div>
    );
}

function StatusBadge({ connected }: { connected?: boolean }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}
            aria-live="polite"
        >
            {connected ? 'Connected' : 'Not connected'}
        </span>
    );
}

function Spinner() {
    return (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
    );
}

export default function YouCanWebhookSetup({ onClose }: { onClose?: () => void }) {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/webhooks/youcan/store')
            .then(async (res) => {
                if (!res.ok) { if (mounted) setStore(null); return; }
                const data = await res.json(); if (mounted) {
                    const s = data.store || null;
                    setStore(s);
                }
            })
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));
        return () => { mounted = false };
    }, []);

    // Start OAuth connect flow (redirects to /api/youcan/connect)
    function handleConnect() {
        window.location.href = '/api/youcan/connect';
    }

    async function handleDisconnect() {
        if (!store) return; setLoading(true);
        try {
            const res = await fetch('/api/webhooks/youcan/store', { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to disconnect');
            setStore(null);
            setSuccess('Disconnected');
        } catch (err: any) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    async function handleRefresh() {
        setLoading(true);
        try {
            const res = await fetch('/api/webhooks/youcan/store');
            if (!res.ok) { setStore(null); return; }
            const data = await res.json(); setStore(data.store || null);
        } catch (err: any) {
            setError(String(err));
        } finally { setLoading(false); }
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose && onClose()} />
            <div className="relative max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-center -mt-6 mb-3">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(180deg,#fff7ed 0%, #fffbf0 100%)' }}>
                        <img src="https://khamsat.hsoubcdn.com/images/services/2777808/df2fd04728e150af95fbc868ac35135d.jpg" alt="YouCan" className="w-9 h-9 object-contain" />
                    </div>
                </div>

                <div className="text-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">YouCan Integration</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Connect your YouCan store so Yurafy can register webhooks and import orders.</p>
                    <div className="mt-2">
                        <StatusBadge connected={!!store?.connect} />
                    </div>
                </div>

                {error && <div className="mb-3"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
                {success && <div className="mb-3"><Alert type="success" message={success} onClose={() => setSuccess(null)} /></div>}

                {/* Webhook URL input removed — webhooks are registered automatically via OAuth. */}

                {store?.token && (
                    <div className="mt-3">
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Webhook token</label>
                        <div className="mt-2 flex gap-2 items-center">
                            <input readOnly value={store.token} aria-label="YouCan webhook token" className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]" />
                            <CopyButton value={store.token} label="Copy webhook token" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Copy the token if you need to paste it into the YouCan portal directly.</p>
                    </div>
                )}

                {store?.subscriptionId && (
                    <div className="mt-3">
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Subscription ID</label>
                        <div className="mt-2 flex gap-2 items-center">
                            <input readOnly value={store.subscriptionId} aria-label="YouCan subscription id" className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]" />
                            <CopyButton value={store.subscriptionId} label="Copy subscription id" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This ID identifies the RESThook subscription in YouCan.</p>
                    </div>
                )}

                <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Connect your YouCan store via OAuth so Yurafy can create the webhook and read orders. Click Connect to begin.</p>
                </div>

                <div className="mt-4 flex gap-2">
                    {!store?.connect && (
                        <button className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-md inline-flex items-center" onClick={handleConnect} disabled={loading} aria-label="Connect YouCan">
                            {loading ? <><Spinner />Connecting...</> : 'Connect YouCan'}
                        </button>
                    )}

                    {store?.connect && (
                        <>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-md inline-flex items-center" onClick={handleDisconnect} disabled={loading} aria-label="Disconnect YouCan">
                                {loading ? <><Spinner />Disconnecting...</> : 'Disconnect'}
                            </button>
                            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md" onClick={handleRefresh} aria-label="Refresh status">Refresh</button>
                        </>
                    )}

                    <button className="ml-auto px-3 py-2 rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]" onClick={() => onClose && onClose()} aria-label="Close">Close</button>
                </div>

                <div className="mt-4">
                    <button aria-expanded={showInstructions} aria-controls="youcan-instructions" onClick={() => setShowInstructions(s=>!s)} className="text-sm text-[var(--brand-blue)] underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]">{showInstructions ? 'Hide instructions' : 'Show instructions'}</button>
                    {showInstructions && (
                        <div id="youcan-instructions" className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            <ol className="list-decimal list-inside space-y-2">
                                <li><strong>Open</strong> the YouCan Developer Portal and navigate to Webhooks.</li>
                                    <li><strong>Click</strong> Connect above to authorize Yurafy to manage webhooks for your store.</li>
                                    <li><strong>Yurafy</strong> will automatically register the webhook and create the subscription; you can copy the <em>Webhook token</em> below if you need it.</li>
                                    <li><strong>Ensure</strong> order.created events are enabled in your store if required.</li>
                            </ol>
                            <p className="mt-2 text-xs text-gray-500">If you rotate the client secret, update it here and re-save the webhook in YouCan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
