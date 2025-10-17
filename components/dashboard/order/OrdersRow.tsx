'use client';
import { IOrder } from '@/models/orders';
import { FaTrash } from 'react-icons/fa';

interface OrdersRowProps {
    order: IOrder;
    index: number;
    setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
}

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-yellow-400 text-gray-800',
    confirmed: 'bg-blue-400 text-white',
    shipped: 'bg-indigo-500 text-white',
    delivered: 'bg-green-500 text-white',
    cancelled: 'bg-red-500 text-white',
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
        <tr className="border-t border-gray-600 hover:bg-gray-800/40 transition">
        <td className="px-4 py-2">{index + 1}</td>
        <td className="px-4 py-2">{order.shippingAddress.fullName}</td>
        <td className="px-4 py-2">{order.shippingAddress.phone}</td>
        <td className="px-4 py-2">{order.shippingAddress.address}</td>
        <td className="px-4 py-2">
            {order.products.map((p, idx) => (
            <div key={idx} className="flex justify-between gap-2 mb-1">
                <span>{p.product}</span> <span>{p.quantity}×</span>
            </div>
            ))}
        </td>
        <td className="px-4 py-2">{order.totalAmount} MAD</td>
        <td className="px-4 py-2">
            <select
            className={`px-2 py-1 rounded border border-gray-600 text-sm font-semibold ${STATUS_COLORS[order.status]}`}
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            >
            {Object.keys(STATUS_COLORS).map((status) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
            </select>
        </td>
        <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
        <td className="px-4 py-2">
            <button onClick={deleteOrder} className="p-2 rounded bg-red-600 hover:bg-red-500 text-white">
            <FaTrash />
            </button>
        </td>
        </tr>
    );
}
