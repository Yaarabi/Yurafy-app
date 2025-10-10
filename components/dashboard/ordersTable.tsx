'use client';

import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { IOrder } from '@/models/orders';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import CSVExport from './product/CSVexport';

export default function OrdersTable() {
    const t = useTranslations('orders');
    const { data: session } = useSession();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [productFilter, setProductFilter] = useState('');
    const [addressFilter, setAddressFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const columns: { key: string; label: string }[] = [
        { key: 'index', label: '#' },
        { key: 'customer', label: t('columns.customer') },
        { key: 'phone', label: t('columns.phone') },
        { key: 'address', label: t('columns.address') },
        { key: 'products', label: 'Products' },
        { key: 'totalAmount', label: t('columns.total') },
        { key: 'status', label: t('columns.status') },
        { key: 'createdAt', label: 'Date' },
    ];

    // Fetch orders
    useEffect(() => {
        async function fetchOrders() {
        if (!session?.user?.id) return;
        try {
            const res = await fetch(`/api/orders?owner=${session.user.id}`);
            const data = await res.json();
            if (!data.orders || data.orders.length === 0) {
            setOrders([]);
            return;
            }

            // Fetch product names
            const ordersWithNames = await Promise.all(
            data.orders.map(async (order: IOrder) => {
                const productsWithNames = await Promise.all(
                order.products.map(async (p: any) => {
                    try {
                    const res = await fetch(`/api/products?id=${p.product}`);
                    const prodData = await res.json();
                    return { ...p, product: prodData.product?.name };
                    } catch {
                    return { ...p, product: 'Unknown' };
                    }
                })
                );
                return { ...order, products: productsWithNames };
            })
            );

            setOrders(ordersWithNames);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        }

        fetchOrders();
    }, [session?.user?.id]);

    // Update order status
    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
        const res = await fetch(`/api/orders?id=${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            const data = await res.json();
            setOrders((prev) =>
            prev.map((o) => (o._id === orderId ? data.order : o))
            );
        } else {
            alert('Failed to update status');
        }
        } catch (err) {
        console.error(err);
        alert('Server error while updating status');
        }
    };

    // Delete order
    const deleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
        const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
        if (res.ok) {
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
        } else {
            alert('Failed to delete order');
        }
        } catch (err) {
        console.error(err);
        alert('Server error while deleting order');
        }
    };

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        const productMatch = productFilter
        ? order.products.some((p) =>
            p.product?.toLowerCase().includes(productFilter.toLowerCase())
            )
        : true;
        const addressMatch = addressFilter
        ? order.shippingAddress.address
            .toLowerCase()
            .includes(addressFilter.toLowerCase())
        : true;
        const dateMatch = dateFilter
        ? new Date(order.createdAt).toLocaleDateString() === dateFilter
        : true;
        const statusMatch = statusFilter ? order.status === statusFilter : true;

        return productMatch && addressMatch && dateMatch && statusMatch;
    });

    return (
        <div className="space-y-4">
        {/* CSV Export Button */}
        <div className="flex justify-end">
            <CSVExport orders={filteredOrders} />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full bg-gray-700 text-gray-200">
            <thead className="bg-gray-800/80">
                <tr>
                {columns.map((col) => (
                    <th key={col.key} className="text-left px-4 py-2 font-medium">
                    {col.label}
                    </th>
                ))}
                <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
                <tr className="bg-gray-800/60">
                <th />
                <th />
                <th />
                <th>
                    <select
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
                    >
                    <option value="">All</option>
                    {[...new Set(orders.map((o) => o.shippingAddress.address))].map(
                        (addr) => (
                        <option key={addr} value={addr}>
                            {addr}
                        </option>
                        )
                    )}
                    </select>
                </th>
                <th>
                    <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
                    >
                    <option value="">All</option>
                    {[
                        ...new Set(
                        orders.flatMap((o) => o.products.map((p) => p.product))
                        ),
                    ].map((prod) => (
                        <option key={prod} value={prod}>
                        {prod}
                        </option>
                    ))}
                    </select>
                </th>
                <th />
                <th>
                    <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
                    >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    </select>
                </th>
                <th>
                    <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
                    >
                    <option value="">All</option>
                    {[...new Set(orders.map((o) =>
                        new Date(o.createdAt).toLocaleDateString()
                    ))].map((d) => (
                        <option key={d} value={d}>
                        {d}
                        </option>
                    ))}
                    </select>
                </th>
                <th />
                </tr>
            </thead>

            <tbody>
                {loading ? (
                <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-4 text-center text-gray-400">
                    Loading...
                    </td>
                </tr>
                ) : filteredOrders.length === 0 ? (
                <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-4 text-center text-gray-400">
                    No orders found
                    </td>
                </tr>
                ) : (
                filteredOrders.map((order, index) => (
                    <tr key={order._id} className="border-t border-gray-600 hover:bg-gray-800/40 transition">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{order.shippingAddress.fullName}</td>
                    <td className="px-4 py-2">{order.shippingAddress.phone || 'N/A'}</td>
                    <td className="px-4 py-2">{order.shippingAddress.address}</td>
                    <td className="px-4 py-2">
                        <ul className="space-y-2">
                        {order.products.map((p, idx) => (
                            <li
                            key={idx}
                            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 shadow-sm flex flex-col gap-1 hover:bg-gray-800/80 transition"
                            >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-100 text-sm">{p.product}</span>
                                <span className="text-xs text-gray-300">{p.quantity}×</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {p.color && (
                                <span
                                    className="bg-gray-900/70 border border-gray-700 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: p.color }}
                                >
                                    {p.color}
                                </span>
                                )}
                                {p.size && (
                                <span className="bg-gray-900/70 border border-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                                    {p.size}
                                </span>
                                )}
                            </div>
                            </li>
                        ))}
                        </ul>
                    </td>
                    <td className="px-4 py-2">{order.totalAmount} MAD</td>
                    <td className="px-4 py-2">
                        <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="bg-gray-700 text-gray-200 px-2 py-1 rounded border border-gray-600 text-sm"
                        >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        </select>
                    </td>
                    <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                        <button
                        onClick={() => deleteOrder(order._id)}
                        className="p-2 rounded bg-red-600 hover:bg-red-500 text-white transition"
                        >
                        <FaTrash />
                        </button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
}
