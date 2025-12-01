"use client";
import React, { useEffect, useState } from "react";
import CustomerFilters from "@/components/dashboard/customers/CustomerFilters";
import CustomerTable from "@/components/dashboard/customers/CustomerTable";
import BulkActionsMenu from "@/components/dashboard/order/BulkActionsMenu";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import LogoLoader from "@/components/themePreview/loadder";
import { Users } from "lucide-react";

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
    const { data: featuresData, loading: featuresLoading } = useUserFeatures();
    const hasWhatsApp = featuresData?.planFeatures?.hasWhatsApp ?? false;
    const [data, setData] = useState<CustomerStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    const [filters, setFilters] = useState({ status: "All", address: "" });
    const limit = 20;

    useEffect(() => {
        if (featuresLoading) return;
        
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
        
        fetchData();
    }, [page, featuresLoading]);

    // Show LogoLoader while features are loading
    if (featuresLoading) return <LogoLoader />;

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header Section */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 rounded-lg">
                        <Users className="w-6 h-6 text-[var(--brand-blue)]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Customers
                    </h2>
                </div>

                {/* Filters */}
                <CustomerFilters filters={filters} onChange={setFilters} />

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                        ordersData={filteredData}
                        onClear={() => setSelected([])}
                    />
                )}

                {/* Pagination - Only show when there's more than 1 page */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                        >
                            Prev
                        </button>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Page {page} of {totalPages}
                        </div>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= totalPages}
                            className="px-4 py-2 rounded-lg bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
