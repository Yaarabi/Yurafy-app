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

type OrdersFiltersType = {
    product: string;
    address: string;
    status: '' | 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    date: string;
};

export default function OrdersTable() {
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

    // Fetch orders
    useEffect(() => {
        async function fetchOrders() {
        try {
            const res = await fetch(`/api/orders`);
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        }
        fetchOrders();
    }, [session?.user?.id]);

    // Filtered orders
    const filteredOrders = orders.filter((o) => {
    const productMatch = filters.product
        ? o.products.some((p) =>
            p.name.toLowerCase().includes(filters.product.toLowerCase())
        )
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


    return (
        <div className="space-y-6">
        {/* Actions (Upload CSV / Add Order) */}
        <OrdersActions orders={orders} setOrders={setOrders} setShowAddModal={setShowAddModal} />

        {/* Filters */}
        <OrdersFilters filters={filters} setFilters={setFilters} orders={orders} />

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80">
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-brand-blue rounded-full animate-spin"></div>
                                <span>Loading orders...</span>
                            </div>
                        </td>
                    </tr>
                ) : filteredOrders.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No orders found
                        </td>
                    </tr>
                ) : (
                filteredOrders.map((order, idx) => (
                    <tr
                        key={order._id}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-gray-200">{idx + 1}</td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-gray-200">{order.shippingAddress.fullName}</td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-gray-200">{order.shippingAddress.phone}</td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-gray-200">{order.shippingAddress.address}</td>
                        <td className="px-4 py-4 text-sm">
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                {order.products.map((p, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg"
                                    >
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {p.name}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {p.quantity}×
                                        </span>
                                        {p.size && (
                                            <span className="text-xs px-2 py-1 bg-brand-blue/90 dark:bg-brand-blue/80 text-white rounded-full">
                                                Size: {p.size}
                                            </span>
                                        )}
                                        {p.color && (
                                            <span className="text-xs px-2 py-1 bg-emerald-500/90 dark:bg-emerald-600/80 text-white rounded-full">
                                                Color: {p.color}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order.totalAmount} MAD
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                                order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                                order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                                order.status === 'confirmed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                                'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200'
                            }`}>
                                {order.status}
                            </span>
                        </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                            {/* Edit Icon */}
                            <button
                                onClick={() => setEditingOrder(order)}
                                className="p-2 rounded-full bg-brand-blue hover:bg-brand-blue/90 dark:hover:bg-brand-blue/80 text-white flex items-center justify-center transition-colors"
                                title="Edit Order"
                            >
                                <FaEdit className="w-4 h-4" />
                            </button>

                            {/* Delete Icon */}
                            <button
                                onClick={async () => {
                                if (!confirm('Are you sure?')) return;
                                try {
                                    const res = await fetch(`/api/orders?id=${order._id}`, { method: 'DELETE' });
                                    if (res.ok) setOrders((prev) => prev.filter((o) => o._id !== order._id));
                                } catch (err) {
                                    console.error(err);
                                }
                                }}
                                className="p-2 rounded-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white flex items-center justify-center transition-colors"
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

        {/* Add Order Modal */}
        {showAddModal && (
            <AddOrderModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAddOrder={(newOrder: IOrder) => setOrders((prev) => [...prev, newOrder])}
            />
        )}

        {/* Update Order Modal */}
        {editingOrder && (
            <UpdateOrderModal
            show={!!editingOrder}
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            onUpdateOrder={(updatedOrder) =>
                setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)))
            }
            />
        )}
        </div>
    );
}
