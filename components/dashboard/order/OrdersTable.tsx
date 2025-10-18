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
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full bg-gray-700 text-gray-200">
            <thead className="bg-gray-800/80">
                <tr>
                <th className="px-4 py-2">#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-400">
                    Loading...
                    </td>
                </tr>
                ) : filteredOrders.length === 0 ? (
                <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-400">
                    No orders found
                    </td>
                </tr>
                ) : (
                filteredOrders.map((order, idx) => (
                    <tr
                    key={order._id}
                    className="border-t border-gray-600 hover:bg-gray-800/40 transition"
                    >
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{order.shippingAddress.fullName}</td>
                    <td className="px-4 py-2">{order.shippingAddress.phone}</td>
                    <td className="px-4 py-2">{order.shippingAddress.address}</td>
                    <td className="px-4 py-2">
                    <div className="flex flex-col gap-1">
                        {order.products.map((p, i) => (
                        <div
                            key={i}
                            className="flex flex-wrap items-center gap-2 bg-gray-800/50 p-1 rounded-md"
                        >
                            <span className="font-medium">{p.name}</span>
                            <span className="text-sm text-gray-400">{p.quantity}×</span>
                            {p.size && (
                            <span className="text-xs px-1 py-0.5 bg-blue-600 text-white rounded">
                                Size: {p.size}
                            </span>
                            )}
                            {p.color && (
                            <span className="text-xs px-1 py-0.5 bg-green-600 text-white rounded">
                                Color: {p.color}
                            </span>
                            )}
                        </div>
                        ))}
                    </div>
                    </td>

                    <td className="px-4 py-2">{order.totalAmount} MAD</td>
                    <td className="px-4 py-2">{order.status}</td>
                    <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 flex gap-2">
                        {/* Edit Icon */}
                        <button
                            onClick={() => setEditingOrder(order)}
                            className="p-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white flex items-center justify-center"
                            title="Edit Order"
                        >
                            <FaEdit />
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
                            className="p-2 rounded bg-red-600 hover:bg-red-500 text-white flex items-center justify-center"
                            title="Delete Order"
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
