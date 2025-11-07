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
import { ShoppingCart } from 'lucide-react';

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
        if (!confirm(t('deleteConfirm'))) return;
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
        <div className="space-y-4 sm:space-y-6 relative">
            {/* Actions */}
            <OrdersActions orders={orders} setOrders={setOrders} setShowAddModal={setShowAddModal} />

            {/* Filters */}
            <OrdersFilters filters={filters} setFilters={setFilters} orders={orders} />

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/80">
                        <tr>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        disabled={!hasWhatsApp}
                                        aria-label="select all orders"
                                        title={!hasWhatsApp ? t('whatsappRequired') : undefined}
                                    />
                                </label>
                            </th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">#</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('columns.customer')}</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">{t('columns.phone')}</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">{t('columns.address')}</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('columns.products')}</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('columns.total')}</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('columns.status')}</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">{t('columns.date')}</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('loading')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order, idx) => (
                                <tr
                                    key={order._id}
                                    className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                        selectedOrders.includes(order._id) ? 'bg-[var(--brand-blue)]/5 dark:bg-[var(--brand-blue)]/10' : ''
                                    }`}
                                >
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] disabled:opacity-50 disabled:cursor-not-allowed"
                                            checked={selectedOrders.includes(order._id)}
                                            onChange={() => toggleSelect(order._id)}
                                            disabled={!hasWhatsApp}
                                            aria-label={`select order ${idx + 1}`}
                                            title={!hasWhatsApp ? t('whatsappRequired') : undefined}
                                        />
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-200 hidden sm:table-cell">{idx + 1}</td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-200 truncate max-w-[120px] sm:max-w-none">{order.shippingAddress.fullName}</td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-200 hidden md:table-cell">{order.shippingAddress.phone}</td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-200 truncate max-w-[150px] hidden lg:table-cell">{order.shippingAddress.address}</td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                                        <div className="flex flex-col gap-1.5 sm:gap-2 min-w-[120px] sm:min-w-[200px]">
                                            {order.products.slice(0, 2).map((p, i) => (
                                                <div key={i} className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-700/50 p-1.5 sm:p-2 rounded-lg">
                                                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{p.name}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{p.quantity}×</span>
                                                </div>
                                            ))}
                                            {order.products.length > 2 && (
                                                <span className="text-xs text-[var(--brand-blue)] font-medium">{t('moreProducts', { count: order.products.length - 2 })}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-[var(--brand-blue)]">{order.totalAmount} MAD</td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                        <span className={`inline-flex px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                            {t(`status.${order.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <button
                                                onClick={() => setEditingOrder(order)}
                                                className="p-1.5 sm:p-2 rounded-lg bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 dark:hover:bg-[var(--brand-blue)]/80 text-white flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50 dark:focus:ring-[var(--brand-blue)]/40"
                                                title={t('edit')}
                                            >
                                                <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order._id)}
                                                className="p-1.5 sm:p-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:focus:ring-red-600/40"
                                                title={t('delete')}
                                            >
                                                <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
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
