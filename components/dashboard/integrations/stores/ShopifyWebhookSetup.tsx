"use client";

import React, { useEffect, useState } from "react";

function CopyButton({ value, label, className }: { value?: string; label?: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    async function doCopy() {
        if (!value) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
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
        } catch (e) {
            console.error('Copy failed', e);
        }
    }

    return (
        <button
            onClick={doCopy}
            disabled={!value}
            aria-label={label || 'Copy'}
            className={`${className || 'px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm'}`}>
            {copied ? 'Copied!' : (label || 'Copy')}
        </button>
    );
}

type Store = {
    _id: string;
    owner: string;
    token: string;
    connect: boolean;
};

export default function ShopifyWebhookSetup({ onClose }: { onClose?: () => void }) {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/webhooks/shopify/store')
            .then(async (res) => {
                if (!res.ok) {
                    setStore(null);
                    return;
                }
                const data = await res.json();
                if (mounted) setStore(data.store || null);
            })
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));

        return () => { mounted = false };
    }, []);

    async function handleGenerate() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/webhooks/shopify/store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to create store');
            setStore(data.store || data);
        } catch (err: any) {
            setError(err.message || String(err));
        } finally { setLoading(false); }
    }

    async function handleDone() {
        if (!store) return;
        setLoading(true);
        try {
            const res = await fetch('/api/webhooks/shopify/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connect: true }) });
            if (!res.ok) throw new Error('Failed to mark as connected');
            const data = await res.json();
            setStore(data.store || store);
            if (onClose) onClose();
        } catch (err: any) {
            setError(err.message || String(err));
        } finally { setLoading(false); }
    }

    const webhookUrl = store?.token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/shopify/new-order/${store.token}` : '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose && onClose()} />

            <div className="relative max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-center -mt-6 mb-3">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(180deg,#ecfdf5 0%, #f0fdf4 100%)' }}>
                        <img src="https://cdn.simpleicons.org/shopify/7AB55C" alt="Shopify" className="w-9 h-9" />
                    </div>
                </div>

                <div className="text-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Connecting Shopify Webhooks</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Follow these steps to add the webhook to your Shopify store.</p>
                </div>

                        <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <div>
                                <strong>Steps to Install script</strong>
                            </div>

                            <ol className="list-decimal list-inside space-y-2 ml-3">
                                <li>Copy the Webhook URL from Yurafy.</li>
                                <li>Log in to your Shopify store.</li>
                                <li>Navigate to Settings &gt; Notifications, then scroll down to the Webhooks section.</li>
                                <li>Click Create Webhook.</li>
                                <li>In the Event dropdown, select Order creation. Paste the copied URL into the URL field and choose the latest API version.</li>
                                <li>Return to Yurafy and click the Done button.</li>
                            </ol>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Webhook URL</label>
                            <div className="mt-2 flex gap-2 items-center">
                                <input readOnly value={webhookUrl} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm" />
                                <CopyButton value={webhookUrl} label="Copy webhook URL" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Use this URL when creating the webhook in Shopify. The token is unique to your account.</p>
                        </div>

                        <div className="mt-4 flex gap-2">
                            {!store && (
                                <button className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-md" onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate webhook'}</button>
                            )}

                            {store && (
                                <>
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-md" onClick={handleDone} disabled={loading}>{loading ? 'Working...' : 'Done'}</button>
                                    <CopyButton value={webhookUrl} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md" label="Copy webhook URL" />
                                </>
                            )}

                            <button className="ml-auto px-3 py-2 rounded-md bg-transparent text-sm" onClick={() => onClose && onClose()}>Close</button>
                        </div>

                        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
}
