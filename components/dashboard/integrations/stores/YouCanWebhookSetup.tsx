"use client";

import React, { useEffect, useState } from "react";

type Store = { _id: string; owner: string; token: string; connect: boolean; clientId?: string; clientSecret?: string };

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
    const [clientIdInput, setClientIdInput] = useState('');
    const [clientSecretInput, setClientSecretInput] = useState('');
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/webhooks/youcan/store')
            .then(async (res) => {
                if (!res.ok) { if (mounted) setStore(null); return; }
                const data = await res.json(); if (mounted) {
                    const s = data.store || null;
                    setStore(s);
                    setClientIdInput(s?.clientId ?? '');
                    setClientSecretInput(s?.clientSecret ?? '');
                }
            })
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));
        return () => { mounted = false };
    }, []);

    async function handleGenerate() {
        setLoading(true); setError(null);
        try {
            const body: any = { clientId: clientIdInput?.trim(), clientSecret: clientSecretInput?.trim() };
            // include connect if store existed
            if (store?.connect) body.connect = store.connect;
            const res = await fetch('/api/webhooks/youcan/store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json(); if (!res.ok) throw new Error(data?.error || 'Failed to create/update store');
            setStore(data.store || data);
            setClientIdInput((data.store || data)?.clientId || clientIdInput);
            setClientSecretInput((data.store || data)?.clientSecret || clientSecretInput);
            setSuccess('Webhook token generated');
        } catch (err: any) { setError(err.message || String(err)); } finally { setLoading(false); }
    }

    async function handleDone() {
        if (!store) return; setLoading(true);
        try {
            const res = await fetch('/api/webhooks/youcan/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connect: true }) });
            if (!res.ok) throw new Error('Failed to mark as connected');
            const data = await res.json(); setStore(data.store || store); if (onClose) onClose();
            setSuccess('Marked as connected');
        } catch (err: any) { setError(err.message || String(err)); } finally { setLoading(false); }
    }

    const webhookUrl = store?.token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/youcan/new-order/${store.token}` : '';

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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Connecting YouCan Webhooks</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Follow these steps to add the webhook to your YouCan store.</p>
                </div>

                {error && <div className="mb-3"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
                {success && <div className="mb-3"><Alert type="success" message={success} onClose={() => setSuccess(null)} /></div>}

                <div className="mt-4">
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Webhook URL</label>
                    <div className="mt-2 flex gap-2 items-center">
                        <input readOnly value={webhookUrl} aria-label="YouCan webhook URL" className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]" />
                        <CopyButton value={webhookUrl} label="Copy webhook URL" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use this URL when creating the webhook in YouCan. The token is unique to your account.</p>
                </div>

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

                {/* Credentials */}
                <div className="mt-4 grid grid-cols-1 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Client ID</label>
                        <div className="mt-2 flex gap-2 items-center">
                            <input value={clientIdInput} onChange={(e) => setClientIdInput(e.target.value)} aria-label="YouCan client id" placeholder="Enter Client ID" className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Client Secret</label>
                        <div className="mt-2 flex gap-2 items-center">
                            <input value={clientSecretInput} onChange={(e) => setClientSecretInput(e.target.value)} aria-label="YouCan client secret" placeholder="Enter Client Secret" type={showSecret ? 'text' : 'password'} className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand-blue)]" />
                            <button onClick={() => setShowSecret(s => !s)} className="px-2 py-1 text-sm border rounded-md">{showSecret ? 'Hide' : 'Show'}</button>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Keep this secret safe: do not share your client secret publicly.</p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    {(!store || !store.token) && (
                        <button className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-md inline-flex items-center" onClick={handleGenerate} disabled={loading || !clientIdInput || !clientSecretInput} aria-label="Save credentials">
                            {loading ? <><Spinner />Saving...</> : 'Save credentials'}
                        </button>
                    )}

                    {store?.token && (
                        <>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-md inline-flex items-center" onClick={handleDone} disabled={loading} aria-label="Mark as connected">
                                {loading ? <><Spinner />Working...</> : 'Done'}
                            </button>
                            <CopyButton value={webhookUrl} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md" label="Copy webhook URL" />
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
                                <li><strong>Create</strong> a new webhook and paste the <em>Webhook URL</em> from above.</li>
                                <li><strong>Copy</strong> the <em>Client ID</em> and <em>Client Secret</em> into the appropriate fields in the portal.</li>
                                <li><strong>Enable</strong> order.created events (or the event you want to receive) and save.</li>
                            </ol>
                            <p className="mt-2 text-xs text-gray-500">If you rotate the client secret, update it here and re-save the webhook in YouCan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
