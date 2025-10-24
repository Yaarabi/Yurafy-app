'use client';
import { IOrder } from '@/models/orders';

export type OrdersFiltersType = {
    product: string;
    address: string;
    status: "" | "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
    date: string;
};

interface OrdersFiltersProps {
    filters: OrdersFiltersType;
    setFilters: React.Dispatch<React.SetStateAction<OrdersFiltersType>>;
    orders: IOrder[];
}

export default function OrdersFilters({ filters, setFilters }: OrdersFiltersProps) {
    return (
        <div className="flex gap-2 mb-4 flex-wrap">
        <input
            placeholder="Filter by product name"
            value={filters.product}
            onChange={(e) =>
            setFilters((prev) => ({ ...prev, product: e.target.value }))
            }
            className="p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--brand-blue)]"
        />
        <input
            placeholder="Filter by address"
            value={filters.address}
            onChange={(e) =>
            setFilters((prev) => ({ ...prev, address: e.target.value }))
            }
            className="p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--brand-blue)]"
        />
        <select
            value={filters.status}
            onChange={(e) =>
            setFilters((prev) => ({
                ...prev,
                status: e.target.value as OrdersFiltersType['status'],
            }))
            }
            className="p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--brand-blue)]"
        >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
        </select>
        <input
            type="date"
            value={filters.date}
            onChange={(e) =>
            setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
            className="p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--brand-blue)]"
        />
        </div>
    );
}
