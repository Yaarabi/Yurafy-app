"use client";

import { useState, type FormEvent } from 'react';

const AMEEX_LOGO = 'https://tse2.mm.bing.net/th/id/OIP.apjcGkqQseQ8OFDewGCXVQAAAA?pid=ImgDet&w=181&h=181&c=7&o=7&rm=3';

export default function AmeexForm({ onClose, onSaved, initial }: { onClose: () => void; onSaved?: (acc: any) => void; initial?: any }) {
  const [apiId, setApiId] = useState(initial?.businessId || initial?.apiId || '');
  const [apiKey, setApiKey] = useState('');
  // businessId is derived from apiId per requirement
  const isEdit = !!initial;
  const [orderStatus, setOrderStatus] = useState(initial?.orderStatus || 'new');
  const [autoSend, setAutoSend] = useState<boolean>(!!initial?.autoSend);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedAccount, setSavedAccount] = useState<any | null>(initial || null);
  const [copied, setCopied] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  async function copyToClipboard(text: string) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        // Use PUT for updates; only send apiKey when provided (not masked)
        const payload: any = {};
        if (apiId) payload.apiId = apiId;
        if (apiKey && apiKey.trim() && apiKey !== '********') payload.apiKey = apiKey;
        if (typeof orderStatus === 'string') payload.orderStatus = orderStatus;
        payload.autoSend = !!autoSend;
        res = await fetch('/api/delivery/ameex/account', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // creation: businessId is apiId
        const businessIdToSend = apiId;
        res = await fetch('/api/delivery/ameex/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiId, apiKey, businessId: businessIdToSend, orderStatus, autoSend }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      setSavedAccount(data.account);
      onSaved && onSaved(data.account);
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    if (!confirm('Delete Ameex connection? This will remove saved credentials.')) return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/delivery/ameex/account', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete');
      setSavedAccount(null);
      onSaved && onSaved(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function runTestSend() {
    setTestResult(null);
    setTestLoading(true);
    try {
      const res = await fetch('/api/delivery/ameex/test', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Test failed');
      setTestResult({ ok: true, data });
    } catch (err: any) {
      setTestResult({ ok: false, error: err?.message || 'Test failed' });
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden m-4">
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
          <img src={AMEEX_LOGO} alt="Ameex" className="w-12 h-12 rounded-md object-cover" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Connect Ameex</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your Ameex credentials and get the webhook URL.</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={submit} className="p-4 grid gap-3">
          <input value={apiId} onChange={e => setApiId(e.target.value)} placeholder="API ID" className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-900" />
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={isEdit ? 'Leave blank to keep current key' : 'API Key'} className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-900" type="password" required={!isEdit} />
          {isEdit && <div className="text-xs text-gray-500">API Key is not shown for security. Enter a new key to update it.</div>}
          <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-900">
            <option value="new">Map to: new</option>
            <option value="confirmed">Map to: confirmed</option>
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoSend} onChange={e => setAutoSend(e.target.checked)} /> Auto send orders
          </label>
          {error && <div className="text-sm text-red-500">{error}</div>}

          {/* Show webhook once we have a savedAccount (or initial token) */}
          {(savedAccount?.token || initial?.token) && (
            <div className="mt-4 p-3 rounded border bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <img src={AMEEX_LOGO} alt="Ameex" className="w-10 h-10 rounded-md object-cover" />
                <div className="flex-1">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Webhook URL</div>
                  <input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/delivery/ameex/webhook/${(savedAccount?.token || initial?.token)}`} className="w-full p-2 rounded mt-1 bg-white dark:bg-gray-800 border" />
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/delivery/ameex/webhook/${(savedAccount?.token || initial?.token)}`)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700">Copy</button>
                  {copied && <div className="text-xs text-green-600">Copied!</div>}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4 items-center">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-[var(--brand-blue)] text-white">{loading ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Close</button>
            {savedAccount && (
              <>
                <button type="button" onClick={runTestSend} disabled={testLoading} className="px-4 py-2 rounded bg-amber-500 text-white">
                  {testLoading ? 'Testing...' : 'Test send'}
                </button>
                <button type="button" onClick={deleteAccount} disabled={deleteLoading} className="ml-auto px-4 py-2 rounded bg-red-600 text-white">
                  {deleteLoading ? 'Deleting...' : 'Delete connection'}
                </button>
              </>
            )}
          </div>
          {testResult && (
            <div className={`mt-3 p-3 rounded ${testResult.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {testResult.ok ? (
                <div>
                  <strong>Test sent</strong>
                  <div className="text-xs mt-1">Order: {testResult.data?.order_num || '—'}</div>
                  <div className="text-xs mt-1">Status: {testResult.data?.status}</div>
                  {testResult.data?.body && <div className="text-xs mt-1">Response: {String(testResult.data.body).slice(0, 200)}</div>}
                </div>
              ) : (
                <div>
                  <strong>Test failed</strong>
                  <div className="text-xs mt-1">{testResult.error}</div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
