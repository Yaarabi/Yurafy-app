"use client";
import React from "react";
import { CustomerStat } from "@/app/[locale]/dashboard/customers/page";

interface Props {
    data: CustomerStat[];
    loading: boolean;
    selected: string[];
    onSelect: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
}

export default function CustomerTable({ data, loading, selected, onSelect, onSelectAll }: Props) {
    const allSelected = data.length > 0 && selected.length === data.length;

    const getStatusStyle = (status?: string) => {
        switch (status) {
        case "confirmed":
            return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
        case "cancelled":
            return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
        case "delivered":
            return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
        case "new":
            return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
        default:
            return "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200";
        }
    };

    return (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr className="text-xs uppercase text-gray-600 dark:text-gray-300 tracking-wide">
                <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll(e.target.checked)} />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Delivered</th>
                <th className="px-4 py-3 text-right">Cancelled</th>
                <th className="px-4 py-3 text-right">Spent</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3">Status</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
                <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading…
                </td>
                </tr>
            ) : data.length === 0 ? (
                <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No customers found
                </td>
                </tr>
            ) : (
                data.map((c) => (
                <tr
                    key={c.customerId}
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selected.includes(c.customerId) ? "bg-gray-100 dark:bg-gray-700/50" : ""
                    }`}
                >
                    <td className="px-4 py-3">
                    <input
                        type="checkbox"
                        checked={selected.includes(c.customerId)}
                        onChange={(e) => onSelect(c.customerId, e.target.checked)}
                    />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name ?? "Guest"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {c.address?.address ?? "No address"}
                    {c.address?.city ? `, ${c.address.city}` : ""}
                    {c.address?.country ? `, ${c.address.country}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-right text-green-500">{c.deliveredOrders}</td>
                    <td className="px-4 py-3 text-right text-red-500">{c.cancelledOrders}</td>
                    <td className="px-4 py-3 text-right text-gray-500">${Number(c.totalSpent ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(c.lastOrderStatus ?? undefined)}`}>
                        {c.lastOrderStatus ?? "—"}
                    </span>
                    </td>
                </tr>
                ))
            )}
            </tbody>
        </table>
        </div>
    );
}
