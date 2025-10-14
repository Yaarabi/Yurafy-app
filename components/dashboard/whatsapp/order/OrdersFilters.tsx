// OrdersFilters.tsx
'use client';
import { IOrder } from '@/models/orders';

export type OrdersFiltersType = {
    product: string;
    address: string;
    status: "" | "new" | "processing" | "shipped" | "delivered" | "cancelled";
    date: string;
};

interface OrdersFiltersProps {
    filters: OrdersFiltersType;
    setFilters: React.Dispatch<React.SetStateAction<OrdersFiltersType>>;
    orders: IOrder[];
}

export default function OrdersFilters({ filters, setFilters }: OrdersFiltersProps) {
    return (
        <div className="flex gap-2 mb-4">
        <input
            placeholder="Product"
            value={filters.product}
            onChange={(e) => setFilters((prev) => ({ ...prev, product: e.target.value }))}
            className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
            placeholder="Address"
            value={filters.address}
            onChange={(e) => setFilters((prev) => ({ ...prev, address: e.target.value }))}
            className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <select
            value={filters.status}
            onChange={(e) =>
            setFilters((prev) => ({
                ...prev,
                status: e.target.value as OrdersFiltersType['status'],
            }))
            }
            className="p-2 rounded bg-gray-700 border border-gray-600"
        >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
        </select>
        <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
            className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        </div>
    );
}
