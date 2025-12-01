'use client';

import { FaPaperPlane, FaBullhorn, FaTimes, FaStop } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface Props {
    selectedOrders: string[];
    onClear: () => void;
    ordersData?: any[]; // Full order/customer objects to extract phone numbers
}

export default function BulkActionsMenu({ selectedOrders, onClear, ordersData = [] }: Props) {
    const [isSending, setIsSending] = useState(false);
    const [cancelToken, setCancelToken] = useState({ canceled: false });

    const sendInBatches = async (orders: string[], endpoint: string) => {
        if (!orders.length) return;
        setIsSending(true);
        cancelToken.canceled = false;

        const batchSize = 5;
        const delayMs = 3000;

        // Extract phone numbers from ordersData based on selected IDs
        const selectedData = ordersData.filter((item: any) => 
            orders.includes(item._id || item.customerId)
        );
        
        const phones = selectedData
            .map((item: any) => item.shippingAddress?.phone || item.phone)
            .filter(Boolean);

        if (!phones.length) {
            toast.error('No phone numbers found for selected items');
            setIsSending(false);
            return;
        }

        toast.loading(`Sending 0/${phones.length} messages...`, { id: 'sending' });

        let sent = 0;

        for (let i = 0; i < phones.length; i += batchSize) {
            if (cancelToken.canceled) break;
            const batch = phones.slice(i, i + batchSize);

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phones: batch }),
                    credentials: 'include',
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Batch failed');
                }

                sent += batch.length;
                toast.loading(`Sent ${sent}/${phones.length} messages...`, { id: 'sending' });
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
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-lg p-4 flex gap-4 items-center border border-gray-200 dark:border-gray-700 animate-fadeIn z-50">
            <span className="text-sm text-gray-600 dark:text-gray-300">{selectedOrders.length} selected</span>

            <button
                onClick={() => sendInBatches(selectedOrders, '/api/whatsapp/send-ad-template')}
                disabled={isSending}
                className="bg-[var(--brand-blue)] hover:opacity-90 text-white px-3 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
                <FaBullhorn /> Send Ad Template
            </button>

            {isSending && (
                <button
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded flex items-center gap-2"
                    title="Cancel sending"
                >
                    <FaStop /> Cancel
                </button>
            )}

            <button
                onClick={onClear}
                disabled={isSending}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded disabled:opacity-50 text-gray-700 dark:text-gray-200"
                title="Clear selection"
            >
                <FaTimes />
            </button>
        </div>
    );
}
