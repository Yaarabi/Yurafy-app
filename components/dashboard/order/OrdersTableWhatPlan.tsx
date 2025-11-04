'use client';

import { useEffect, useState } from 'react';
import { IOrder } from '@/models/orders';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import OrdersFilters from './OrdersFilters';
import AddOrderModal from './AddOrderModal';
import OrdersActions from './OrdersActions';
import UpdateOrderModal from './UpdateOrderModal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import BulkActionsMenu from './BulkActionsMenu';

type OrdersFiltersType = {
    product: string;
    address: string;
    status: '' | 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    date: string;
};

interface OrdersTableWhatPlanProps {
    hasWhatsApp?: boolean;
}

export default function OrdersTableWhatPlan({ hasWhatsApp = false }: OrdersTableWhatPlanProps) {
    const t = useTranslations('orders');
    const { data: session } = useSession();

    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<OrdersFiltersType>({
        product: '',
        address: '',
        status: '',
        date: '',
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    // Fetch orders for the authenticated user
    useEffect(() => {
        if (!session?.user?.id) return;

        async function fetchOrders() {
            setLoading(true);
            try {
                const res = await fetch(`/api/orders`);
                const data = await res.json();
                // Filter orders by session.user.id on the client side (optional if API already filters)
                setOrders(data.orders?.filter((o: IOrder) => o.owner === session?.user.id) || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [session?.user?.id]);

    // Filter orders
    const filteredOrders = orders.filter((o) => {
        const productMatch = filters.product
            ? o.products.some((p) => p.name.toLowerCase().includes(filters.product.toLowerCase()))
            : true;
        const addressMatch = filters.address
            ? o.shippingAddress.address.toLowerCase().includes(filters.address.toLowerCase())
            : true;
        const statusMatch = filters.status ? o.status === filters.status : true;
        const dateMatch = filters.date
            ? new Date(o.createdAt).toLocaleDateString() === filters.date
            : true;
        return productMatch && addressMatch && statusMatch && dateMatch;
    });

    // Selection logic - Only allow selection if WhatsApp is enabled
    const toggleSelectAll = () => {
        if (!hasWhatsApp) return;
        if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
        else setSelectedOrders(filteredOrders.map((o) => o._id));
    };

    const toggleSelect = (id: string) => {
        if (!hasWhatsApp) return;
        setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
            if (res.ok) setOrders((prev) => prev.filter((o) => o._id !== orderId));
            else throw new Error('Failed to delete order');
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
            case 'shipped':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
            case 'cancelled':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
            case 'confirmed':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
            default:
                return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Actions */}
            <OrdersActions orders={orders} setOrders={setOrders} setShowAddModal={setShowAddModal} />

            {/* Filters */}
            <OrdersFilters filters={filters} setFilters={setFilters} orders={orders} />

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/80">
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        disabled={!hasWhatsApp}
                                        aria-label="select all orders"
                                        title={!hasWhatsApp ? "WhatsApp feature required" : undefined}
                                    />
                                </label>
                            </th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-brand-blue rounded-full animate-spin"></div>
                                        <span>Loading orders...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No orders found</td>
                            </tr>
                        ) : (
                            filteredOrders.map((order, idx) => (
                                <tr
                                    key={order._id}
                                    className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                        selectedOrders.includes(order._id) ? 'bg-gray-100 dark:bg-gray-700/60' : ''
                                    }`}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
                                            checked={selectedOrders.includes(order._id)}
                                            onChange={() => toggleSelect(order._id)}
                                            disabled={!hasWhatsApp}
                                            aria-label={`select order ${idx + 1}`}
                                            title={!hasWhatsApp ? "WhatsApp feature required" : undefined}
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{idx + 1}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{order.shippingAddress.fullName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{order.shippingAddress.phone}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{order.shippingAddress.address}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            {order.products.map((p, i) => (
                                                <div key={i} className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{p.quantity}×</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{order.totalAmount} MAD</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingOrder(order)}
                                                className="p-2 rounded-full bg-brand-blue hover:bg-brand-blue/90 dark:hover:bg-brand-blue/80 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/50 dark:focus:ring-brand-blue/40"
                                                title="Edit Order"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order._id)}
                                                className="p-2 rounded-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:focus:ring-red-600/40"
                                                title="Delete Order"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bulk Actions Menu - Only show if WhatsApp is enabled */}
            {selectedOrders.length > 0 && hasWhatsApp && <BulkActionsMenu selectedOrders={selectedOrders} onClear={() => setSelectedOrders([])} />}

            {/* Add / Update Modals */}
            {showAddModal && (
                <AddOrderModal show={showAddModal} onClose={() => setShowAddModal(false)} onAddOrder={(newOrder: IOrder) => setOrders((prev) => [...prev, newOrder])} />
            )}
            {editingOrder && (
                <UpdateOrderModal
                    show={!!editingOrder}
                    order={editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onUpdateOrder={(updatedOrder) => setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)))}
                />
            )}
        </div>
    );
}
