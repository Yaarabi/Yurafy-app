'use client';

import { useEffect, useState } from 'react';
import { IOrder } from '@/models/orders';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import OrdersFilters from './OrdersFilters';
import OrdersRow from './OrdersRow';
import AddOrderModal from './AddOrderModal';
import OrdersActions from './OrdersActions';

type OrdersFiltersType = {
    product: string;
    address: string;
    status: "" | "new" | "processing" | "shipped" | "delivered" | "cancelled";
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
        status: '', // empty string = no filter
        date: '',
    });
    const [showAddModal, setShowAddModal] = useState(false);

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
        ? o.products.some((p) => p.product?.toLowerCase().includes(filters.product.toLowerCase()))
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
        <OrdersActions
            orders={orders}
            setOrders={setOrders}
            setShowAddModal={setShowAddModal} // only pass setShowAddModal
        />

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
                    <OrdersRow key={order._id} order={order} index={idx} setOrders={setOrders} />
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
        </div>
    );
}
