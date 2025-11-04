"use client";
import React, { useEffect, useState } from "react";
import CustomerFilters from "@/components/dashboard/customers/CustomerFilters";
import CustomerTable from "@/components/dashboard/customers/CustomerTable";
import BulkActionsMenu from "@/components/dashboard/order/BulkActionsMenu";
import { useUserFeatures } from "@/hooks/useUserFeatures";

export type Address = {
    address?: string | null;
    city?: string | null;
    country?: string | null;
} | null;

export type CustomerStat = {
    customerId: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: Address;
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    lastOrderAt?: string | null;
    lastOrderStatus?: string | null; 
    status?: string | null;
    };

    export default function MyCustomersList() {
    const { data: featuresData } = useUserFeatures();
    const hasWhatsApp = featuresData?.planFeatures?.hasWhatsApp ?? false;
    const [data, setData] = useState<CustomerStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    const [filters, setFilters] = useState({ status: "All", address: "" });
    const limit = 20;

    // Fetch paginated data
    const fetchData = async () => {
        try {
        setLoading(true);
        const query = new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });
        const res = await fetch(`/api/customers?${query.toString()}`);
        const json = await res.json();
        setData(json.data ?? []);
        // Update totalPages from API meta
        setTotalPages(json.meta?.totalPages ?? 1);
        } catch (e) {
        console.error(e);
        setData([]);
        setTotalPages(1);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

// Client-side filtering
    const filteredData = data.filter((c) => {
        // Filter by last order status
        const statusMatch =
            filters.status === "All" ||
            (c.lastOrderStatus ?? "").toLowerCase() === filters.status.toLowerCase();

        // Filter by address (address, city, or country)
        const addressMatch =
            !filters.address ||
            (c.address?.address?.toLowerCase().includes(filters.address.toLowerCase()) ||
            c.address?.city?.toLowerCase().includes(filters.address.toLowerCase()) ||
            c.address?.country?.toLowerCase().includes(filters.address.toLowerCase()));

        return statusMatch && addressMatch;
    });


    // Selection logic - Only allow selection if WhatsApp is enabled
    const handleSelect = (id: string, checked: boolean) => {
        if (!hasWhatsApp) return;
        setSelected((prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (!hasWhatsApp) return;
        if (checked) {
        setSelected(filteredData.map((c) => c.customerId));
        } else {
        setSelected([]);
        }
    };

    return (
        <div className="max-w-full px-4 space-y-4">
        <h2 className="text-lg mt-6 font-semibold text-gray-900 dark:text-white">
            Customers
        </h2>

        {/* Filters */}
        <CustomerFilters filters={filters} onChange={setFilters} />

        {/* Table */}
        <div className="relative border dark:border-gray-700 rounded-lg overflow-hidden">
            <CustomerTable
            data={filteredData}
            loading={loading}
            selected={selected}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            hasWhatsApp={hasWhatsApp}
            />
        </div>

        {/* Bulk Actions - Only show if WhatsApp is enabled */}
        {selected.length > 0 && hasWhatsApp && (
            <BulkActionsMenu
            selectedOrders={selected}
            onClear={() => setSelected([])}
            />
        )}

        {/* Pagination - Only show when there's more than 1 page */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Prev
                </button>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page {page} of {totalPages}
                </div>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        )}
        </div>
    );
}
