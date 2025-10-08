'use client';

import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IOrder } from '@/models/orders';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

export default function OrdersTable() {
    const t = useTranslations('orders');
    const { data: session } = useSession();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const columns: { key: keyof IOrder | string; label: string }[] = [
        { key: '_id', label: t('columns.id') },
        { key: 'owner', label: t('columns.customer') },
        { key: 'totalAmount', label: t('columns.total') },
        { key: 'status', label: t('columns.status') },
        { key: 'createdAt', label: 'Date' },
    ];

    useEffect(() => {
        async function fetchOrders() {
            if (!session?.user?.id) return;

            try {
                const res = await fetch(`/api/orders?owner=${session.user.id}`);
                const data = await res.json();
                if (data.orders) setOrders(data.orders);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [session?.user?.id]);

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="min-w-full">
                <thead className="bg-gray-800/50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className="text-left px-4 py-2 text-gray-200 font-medium"
                            >
                                {col.label}
                            </th>
                        ))}
                        <th className="px-4 py-2 text-gray-200 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-4 text-center text-gray-400">
                                Loading...
                            </td>
                        </tr>
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-4 text-center text-gray-400">
                                No orders found
                            </td>
                        </tr>
                    ) : (
                        orders.map((order, i) => (
                            <tr key={order._id} className="border-t border-gray-800">
                                {columns.map((col) => (
                                    <td key={String(col.key)} className="px-4 py-2 text-gray-300">
                                        {col.key === 'owner'
                                            ? (order.owner as any)?.name || 'N/A'
                                            : col.key === 'createdAt'
                                            ? new Date(order.createdAt).toLocaleDateString()
                                            : String(order[col.key as keyof IOrder] ?? '')}
                                    </td>
                                ))}
                                <td className="px-4 py-2">
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded bg-blue-600 hover:bg-blue-500 text-white">
                                            <FaEdit />
                                        </button>
                                        <button className="p-2 rounded bg-red-600 hover:bg-red-500 text-white">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
