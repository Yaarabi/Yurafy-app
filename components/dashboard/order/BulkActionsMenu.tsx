'use client';

import { FaPaperPlane, FaBullhorn, FaTimes, FaStop } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface Props {
    selectedOrders: string[];
    onClear: () => void;
}

export default function BulkActionsMenu({ selectedOrders, onClear }: Props) {
    const [isSending, setIsSending] = useState(false);
    const [cancelToken, setCancelToken] = useState({ canceled: false });

    const sendInBatches = async (orders: string[], endpoint: string) => {
        if (!orders.length) return;
        setIsSending(true);
        cancelToken.canceled = false;

        const batchSize = 5;
        const delayMs = 3000;

        toast.loading(`Sending 0/${orders.length} messages...`, { id: 'sending' });

        let sent = 0;

        for (let i = 0; i < orders.length; i += batchSize) {
            if (cancelToken.canceled) break;
            const batch = orders.slice(i, i + batchSize);

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders: batch }),
                    credentials: 'include',
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Batch failed');
                }

                sent += batch.length;
                toast.loading(`Sent ${sent}/${orders.length} messages...`, { id: 'sending' });
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'Error sending batch', { id: 'sending' });
            }

            await new Promise((r) => setTimeout(r, delayMs));
        }

        toast.dismiss('sending');
        if (cancelToken.canceled) toast('Sending canceled', { icon: '⚠️' });
        else toast.success('All messages sent!');
        setIsSending(false);
        onClear();
    };

    const handleCancel = () => {
        cancelToken.canceled = true;
        setIsSending(false);
    };

    return (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white rounded-xl shadow-lg p-4 flex gap-4 items-center border border-gray-600 animate-fadeIn z-50">
            <span className="text-sm text-gray-300">{selectedOrders.length} selected</span>

            <button
                onClick={() => sendInBatches(selectedOrders, '/api/whatsapp/send-confirmations')}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
                <FaPaperPlane /> Send Confirmation
            </button>

            <button
                onClick={() => sendInBatches(selectedOrders, '/api/whatsapp/send-ad-template')}
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
                <FaBullhorn /> Send Ad Template
            </button>

            {isSending && (
                <button
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded flex items-center gap-2"
                    title="Cancel sending"
                >
                    <FaStop /> Cancel
                </button>
            )}

            <button
                onClick={onClear}
                disabled={isSending}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded disabled:opacity-50"
                title="Clear selection"
            >
                <FaTimes />
            </button>
        </div>
    );
}
