'use client';
import { IOrder } from '@/models/orders';
import { FaTrash } from 'react-icons/fa';

interface OrdersRowProps {
    order: IOrder;
    index: number;
    setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
}

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    confirmed: 'bg-brand-blue/10 dark:bg-brand-blue/30 text-brand-blue',
    shipped: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
};

export default function OrdersRow({ order, index, setOrders }: OrdersRowProps) {
    const updateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/orders?id=${order._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const data = await res.json();
                setOrders((prev) => prev.map((o) => (o._id === order._id ? data.order : o)));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteOrder = async () => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/orders?id=${order._id}`, { method: 'DELETE' });
            if (res.ok) setOrders((prev) => prev.filter((o) => o._id !== order._id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{index + 1}</td>
            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.shippingAddress.fullName}</td>
            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.shippingAddress.phone}</td>
            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.shippingAddress.address}</td>
            <td className="px-4 py-2">
                {order.products.map((p, idx) => (
                    <div key={idx} className="flex justify-between gap-2 mb-1 bg-gray-50 dark:bg-gray-900/60 p-2 rounded">
                        <span className="text-gray-900 dark:text-gray-100">{p.product}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{p.quantity}×</span>
                    </div>
                ))}
            </td>
            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.totalAmount} MAD</td>
            <td className="px-4 py-2">
                <select
                    className={`px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm font-semibold ${STATUS_COLORS[order.status]}`}
                    value={order.status}
                    onChange={(e) => updateStatus(e.target.value)}
                >
                    {Object.keys(STATUS_COLORS).map((status) => (
                        <option key={status} value={status} className="capitalize">{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                </select>
            </td>
            <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-2">
                <button onClick={deleteOrder} className="p-2 rounded bg-red-600 hover:bg-red-500 text-white">
                    <FaTrash />
                </button>
            </td>
        </tr>
    );
}
